// deprecated 获取对象有多少层子对象
export default (o) => {
  let queue = [o];
  let level = 1;
  let tmpArr = [];

  for (let j = 0; j < queue.length; j++) {
    const children = queue[j].children;

    // 若有children属性，插入队列
    if (children) {
      tmpArr = tmpArr.concat(children);
    }

    // 表示该层遍历完成，即将进入下一层循环
    if (j === queue.length - 1) {
      level++;
      queue = tmpArr;
      tmpArr = [];
      j = -1;
    }
  }

  return level;
};