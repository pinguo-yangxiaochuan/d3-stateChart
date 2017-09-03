// https://stackoverflow.com/questions/36887428/d3-event-is-null-in-a-reactjs-d3js-component
// import * as d3 from 'd3'; 
// import getBTreeLevelNum from './getBTreeLevelNum';
import d3 from 'd3';

export default (options) => {
  const { 
    boxDom, 
    width,
    height, 
    root,
    gDomTransform,
    handleState,
    handleRelation
   } = options;
  //  console.log(root)

  const padding = { left: 80, right: 50, top: 20, bottom: 20 }; // 边界空白
  const linkLen = 50; // 连线长度
  const transitionTime = 500; // 动画过渡时间
  // let svg = d3.select(boxDom).select('svg');
  // try {
  //   svg.attr('width');
  // } catch (e) {
  //   svg = d3.select(boxDom)
  //   .append('svg')
  //   .attr('width', width + padding.left + padding.right)
  //   .attr('height', height)
  //   .append('g')
  //   .attr('transform', `translate(${padding.left}, ${padding.top})`); // 保留上一次操作的位置
  //   // .attr('transform', gDomTransform || `translate(${padding.left}, ${padding.top})`); // 保留上一次操作的位置
  // }
  
  // let svgWidth = getBTreeLevelNum(root) * linkLen; // svg容器宽度
  // svgWidth = svgWidth < width ? width : svgWidth;

  const boxSelect = d3.select(boxDom);
  boxSelect.select('svg').remove(); // TODO 保证始终只有一个svg渲染
  const svg = boxSelect
  .append('svg')
  .attr('width', width + padding.left + padding.right)
  .attr('height', height)
  .append('g')
  .attr('transform', gDomTransform || `translate(${padding.left}, ${padding.top})`); // 保留上一次操作的位置
  
  const tree = d3.layout.tree()
  .size([height - padding.top - padding.bottom, width - padding.left - padding.right]); // 树状图布局
  const diagonal = d3.svg.diagonal().projection(d => [d.y, d.x]); // 连线画成曲线 使用对角线生成器

  // 重绘函数
  const redraw = (source) => {
    const nodes = tree.nodes(root);
    const links = tree.links(nodes);
    nodes.forEach(d => d.y = d.depth * linkLen);

    // ************** 节点处理 **************
    const stateUpdate = svg // 状态更新
    .selectAll('.state_node')
    .data(nodes, d => d.name + d.depth);

    const stateEnter = stateUpdate.enter(); // 状态新增
    const stateExit = stateUpdate.exit(); // 状态移除

    const stateEnterNode = stateEnter // 生成状态新增节点
    .append('g')
    .attr('class', (d) => {
      // 该节点是否已经删除
      return d.myNodeHidden ? 'state_node-hide' : 'state_node';
    })
    .attr('transform', `translate(${source.y0}, ${source.x0})`)
    .on('click', (d, i) => handleState(i));
    stateEnterNode
    .append('circle')
    .attr('r', 0)
    .style('fill', '#fff');
    stateEnterNode
    .append('text')
    // .attr('x', d => d.children ? -1 * textX : textX)
    .attr('dy', '-0.6em')
    .attr('text-anchor', 'middle')
    .text(d => `${d.name}`.split('|')[0]) // 解析d.name中有效值
    .style('fill-opacity', 0);

    const stateUpdateNode = stateUpdate // 更新状态节点
    .transition()
    .duration(transitionTime)
    .attr('transform', d => `translate(${d.y}, ${d.x})`);
    stateUpdateNode
    .select('circle')
    .attr('r', 4)
    .style('fill', '#fff');
    stateUpdateNode
    .select('text')
    .style('fill-opacity', 1);
    
    const stateExitNode = stateExit // 移除状态节点
    .transition()
    .duration(500)
    .attr('transform', `translate(${source.y}, ${source.x})`)
    .remove();
    stateExitNode
    .select('circle')
    .attr('r', 0);
    stateExitNode
    .select('text')
    .style('fill-opacity', 0);
    // ************** 节点处理 **************
       
    // ************** 连线处理 **************
    const relationUpdate = svg // 关系更新
    .selectAll('.relation_link')
    .data(links, d => d.target.name);
    
    const relationkEnter = relationUpdate.enter();
    const relationkExit = relationUpdate.exit();

    // 关系连线更新
    relationUpdate
    .transition()
    .duration(transitionTime)
    .attr('d', diagonal);
    
    // 关系连线新增
    relationkEnter
    .insert('path', '.state_node')
    .attr('class', (d) => {
      // 首先两点必须存在以及该两点不存在断开关系 才绘制该联线
      return d.source.myNodeHidden || 
             d.target.myNodeHidden || 
             d.source.myNextLinkHidden || 
             d.target.myPreLinkHidden ? 'relation_link-hide' : 'relation_link';
    })
    .attr('d', () => {
      const o = { x: source.x0, y: source.y0 };
      return diagonal({ source: o, target: o });
    })
    .on('click', (d) => handleRelation(d.target))
    .transition()
    .duration(transitionTime)
    .attr('d', diagonal);

    // 关系连线移除
    relationkExit
    .transition()
    .duration(transitionTime)
    .attr('d', () => {
      const o = { x: source.x, y: source.y };
      return diagonal({ source: o, target: o });
    })
    .remove();
    // ************** 连线处理 **************

    nodes.forEach((d) => {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  };

  root.x0 = height / 2; // 给第一个节点添加初始坐标x0和x1
  root.y0 = 0;

  redraw(root); // 以第一个节点为起始节点，重绘
};