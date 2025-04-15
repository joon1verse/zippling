// 📄 mergeUtils.js
// 중복 제거 + 정렬 로직만 들어있는 순수 함수 모듈

export function removeDuplicatesAndSort(items) {
    // 1) link 중복 제거 (postedAt/crawledAt가 달라도 link가 같으면 같은 게시물)
    const seen = new Set();
    const deduped = [];
  
    for (const item of items) {
      // link 없는 항목은 제외
      if (!item.link) continue;
      if (!seen.has(item.link)) {
        seen.add(item.link);
        deduped.push(item);
      }
    }
  
    // 2) postedAt → crawledAt 순 정렬 (최신순)
    //    postedAt이 없으면 crawledAt를 사용
    deduped.sort((a, b) => {
      const aTime = new Date(a.postedAt || a.crawledAt).getTime();
      const bTime = new Date(b.postedAt || b.crawledAt).getTime();
      return bTime - aTime; // 내림차순
    });
  
    return deduped;
  }
  