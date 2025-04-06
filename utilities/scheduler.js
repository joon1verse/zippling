export function runWithRandomInterval(taskFn, minMs, maxMs) {
    const execute = async () => {
      await taskFn();
  
      const nextInterval = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
      console.log(`⏳ 다음 실행까지 ${Math.floor(nextInterval / 1000)}초 대기 중...`);
  
      setTimeout(execute, nextInterval);
    };
  
    execute();
  }
  