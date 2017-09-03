/**
 * 遍历查找指定位置 新建子节点 或 删除该节点 
 * @param {obj} o 所有状态对象
 * @param {str} t 对状态是新建 还是 删除操作 'add' - 添加 'del' - 删除
 * @param {num} i 将要改变的状态位置
 * @param {str} v 新建子节点，该节点的文本内容
 */ 
export const vertical = (o, t, i, v = '') => {
  let loopTimes = 0;
  const tmpO = JSON.parse(JSON.stringify(o)); // no side effects
  const queue = [tmpO];

  const loop = (queue) => {
    for (let j = 0; j < queue.length; j++) {
      const children = queue[j].children;

      // d3 节点不能name属性值重复
      if (!(typeof v === 'string' && v.includes('|'))) {
        v += `|${+new Date()}`;
      }

      if (loopTimes === i) {
        if (t === 'add') {
          if (!children) queue[j].children = [];
          queue[j].children.push({
            name: v
          });
        } else if (t === 'del') {
          if (children) {
            queue[j].myNodeHidden = true;
          } else {
            queue.splice(j, 1);
          }
        }
      }

      loopTimes++;

      if (children && Array.isArray(children)) {
        loop(children);
      }
    }
  };

  loop(queue);

  // console.log('tmpO', tmpO);
  return tmpO;
};

export const horizontal = (o, t, i, v = '') => {
  const tmpO = { ...o };
  let queue = [tmpO];

  for (let j = 0; j < queue.length; j++) {
    let children = queue[j].children;

    // 找到指定位置 新建 或是 删除
    if (j === i) {
      if (t === 'add') {
        if (!children) queue[j].children = [];
        queue[j].children.push({
          name: v
        });
        children = queue[j].children;
      } else if (t === 'del') {
        queue[j].myNodeHidden = true;
      }
    }

    // 若有children属性，插入队列
    if (children) {
      queue = queue.concat(children);
    }
  }

  // console.log(tmpO);
  return tmpO;
};