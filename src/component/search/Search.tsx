import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "../../redux/hooks";
import { searchRepo } from "../../redux/repoSearch/slice";
import styles from './Search.module.css';

export const Search = () => {
    const repoList = useSelector((s) => s.repo.data);
    const loading = useSelector((state) => state.repo.loading);
    const error = useSelector((s) => s.repo.error);
    const hasMore = useSelector((s) => s.repo.hasMore);

    const [keywords, setKeywords] = useState("");
    const [page, setPage] = useState(1);

    const dispatch = useDispatch();
    const pageSize: number = 100;

    const ref = useRef<any>(null);
    const oldTop = useRef(0);

    // 虛擬捲軸
    const [dataSlice, setDataSlice] = useState([]); //數據切片
    const [itemHeight, setItemHeight] = useState(40); //子item高度
    const [scrollDis, setScrollDis] = useState(0);
    const refContainer = useRef<any>();
    const refVirtualContainer = useRef<any>();
    const refItem = useRef<any>();
    let datasource: any = repoList;

    const handleObserver = useCallback((entries) => {
        const target = entries[0];
        // isIntersecting: 監聽的底部div 是否出現在畫面上
        // hasMore 確認有更多資料
        // loading 判斷前一個requst已經結束才再次呼叫
        if (target.isIntersecting && hasMore && !loading) {
            ref.current = setTimeout(() => {
                setPage((prev) => prev + 1);
            }, 1000);
        }
    }, []);

    useEffect(() => {
        // 更換關鍵字
        if (!!keywords) {
            // 清除舊的關鍵字查到的資料            
            dispatch(searchRepo({ keywords: keywords, nextPage: 1, pageSize }));
        }
    }, [keywords]);

    useEffect(() => {
        // loadmore觸發
        if (!!keywords && page !== 1 && !loading) {
            dispatch(searchRepo({ keywords: keywords, nextPage: page, pageSize }));
        }
    }, [page]);

    useEffect(() => {
        //設置虛擬容器高度
        const containerHeight = itemHeight * datasource.length * 2;
        refVirtualContainer.current.style.height = containerHeight + "px";
        //設置可視區域數據
        let refContainerHeight = refContainer.current.clientHeight;
        const num = Math.ceil(refContainerHeight / itemHeight);

        if (page === 1) {
            // 查詢第一次時把畫面設定到最上方
            setDataSlice(datasource.slice(0, num));
        } else {
            // 將loadmore結果更新setData
            setData(oldTop.current, refContainerHeight, containerHeight);
        }

        refContainer.current.addEventListener("scroll", (e) => {
            oldTop.current = e.target.scrollTop;
            setData(e.target.scrollTop, refContainerHeight, containerHeight);
        });
    }, [repoList]);

    const setData = (scrollTop, refContainerHeight, containerHeight) => {
        setDataSlice(
            datasource.slice(
                Math.ceil((scrollTop / containerHeight) * datasource.length),
                Math.ceil(
                    ((scrollTop + refContainerHeight * 2) / containerHeight) *
                    datasource.length
                )
            )
        );
        setScrollDis(scrollTop);
        if (hasMore && !loading &&
            refContainerHeight + scrollTop === containerHeight) {
            ref.current = setTimeout(() => {
                setPage((prev) => prev + 1);
            }, 1000);
        }
    };

    return (
        <div>
            <input onChange={(e) => {
                // 兩秒內沒有修改才做更新
                clearInterval(ref.current);
                ref.current = setTimeout(() => {
                    setPage(1);
                    setKeywords(e.target.value);
                }, 2000);
            }} />
            {error && <p style={{ color: 'red' }}>Error!: {error}</p>}
            <div ref={refContainer} className={styles.container}>
                <div className={styles["virtual-container"]} ref={refVirtualContainer}>
                    <div
                        className={styles.virtual}
                        style={{ transform: `translateY(${scrollDis}px)` }}
                    >
                        {dataSlice.map((item: any, idx) => (
                            <div
                                key={item.full_name}
                                className={styles.item}
                                ref={refItem}
                                style={{ height: itemHeight, lineHeight: `${itemHeight}px` }}
                            >
                                <span>{(item.full_name || 'no full_name')}</span>
                            </div>
                        ))}
                        {<p>Scroll to load more</p>}
                        {loading && <p>loading...</p>}
                        {!hasMore && <p>no more data</p>}
                    </div>
                </div>
            </div>
        </div>
    )
}