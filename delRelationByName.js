/**
 * 遍历查找指定位置删除关系连线 
 * @param {obj} o 所有状态对象
 * @param {str} n 将要删除状态节点的name属性值
 */ 
export default (o, n) => {
  const tmpO = JSON.parse(JSON.stringify(o)); // no side effects
  const queue = [tmpO];

  const loop = (queue) => {
    for (let j = 0; j < queue.length; j++) {
      const tmpQueueItem = queue[j];
      const children = tmpQueueItem.children;

      if (tmpQueueItem.name === n) {
        queue[j].myPreLinkHidden = true;
      }

      if (children && Array.isArray(children)) {
        loop(children);
      }
    }
  };

  loop(queue);

  // console.log('tmpO', tmpO);
  return tmpO;
};