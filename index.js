import { Popconfirm, message  } from 'antd';
import style from './style.less';
import drawMachine from './drawMachine';
import StateModal from '../StateManage/StateModal';
import * as changeStateByIndex from './changeStateByIndex';
import delRelationByName from './delRelationByName';
// require('carno')
// console.log('carno', carno);

class CreateMachine extends React.Component {
  constructor(props) {
    super(props);

    // 解决 d3.event 不能获取位置 试试d3.mouse
    this.validClick = {
      flag: false, // 是否是有效点击 
      type: '' // 点击类型
    }; 

    this.handleStateID = 0; // 待操作状态节点信息
    this.delRelationInfo = null; // 待删除关系连线信息

    this.machineData = null; // 状态机数据

    this.state = {
      machineHandleType: 0, // 0 - 删除关系 1 - 删除状态 2 - 创建状态 
      visible: false // 新增状态弹窗显隐
    };
  }

  // 点击关系连线
  handleRelation = (rInfo) => {
    this.validClick = {
      flag: true,
      type: 'link'
    };
    this.delRelationInfo = rInfo;
  }

  // 点击状态节点
  handleState = (sid) => {
    this.validClick = {
      flag: true,
      type: 'node'
    };
    this.handleStateID = sid;
  }

  // 确认删除关系
  handleConfirmDeleteRelation = () => {
    this.props.onSaveState(delRelationByName(this.machineData, this.delRelationInfo.name));
  }

  // 删除状态
  handleDeleteState = () => {
    this.comfirmDelStateDom.style.transform = this.delStateDom.style.transform;
    this.comfirmDelStateDom.click();
  }

  // 确认删除状态
  handleConfirmDeleteState = () => {
    this.props.onSaveState(changeStateByIndex.vertical(
      this.machineData, 
      'del', 
      this.handleStateID
    ));
  }

  // 创建状态
  handleCreateState = () => {
    this.setState({
      visible: Symbol()
    })
   
  }

  // 保存创建状态
  handleSaveState = (param) => {
    this.props.onSaveState(changeStateByIndex.vertical(
      this.machineData, 
      'add', 
      this.handleStateID,
      param.machine
    ));
  }

  componentDidMount() {
    /**
     * 监听绘制区域的点击事件
     * 只有点击关系连线和节点才处理
     */
    this.clickCb = (e) => {
      const { flag, type } = this.validClick;

      if (flag) {
        this.validClick = { flag: false, type: ''};
        if (type === 'node') {
          this.delStateDom.style.transform = `translate(${e.offsetX}px, ${e.offsetY}px)`;
          this.delStateDom.click();
        } else if (type === 'link') {
          this.delRelationDom.style.transform = `translate(${e.offsetX}px, ${e.offsetY}px)`;
          this.delRelationDom.click();
        }
      }

      return;
    }

    // 缩放
    let scale = 1;
    this.mousewheelCb = (e) => {
      e.preventDefault();
      scale += Math.sign(e.deltaY) * 0.1;
      // 不使用d3默认缩放事件
      const transform = `${this.gDom.getAttribute('transform').replace(/scale\(.*?\)/, '')}scale(${scale})`;
      this.gDomTransform = transform;
      this.gDom.setAttribute('transform', transform);
    };

    // 拖拽
    let gDomTransX = 80;
    let gDomTransY = 20;
    this.dragCb = (e) => {
      const gDomoffsetX = e.offsetX - gDomTransX;
      const gDomoffsetY = e.offsetY - gDomTransY;

      const mousemoveCb = (e) => {
        gDomTransX = e.offsetX - gDomoffsetX;
        gDomTransY = e.offsetY - gDomoffsetY;
        const transform = `${this.gDom.getAttribute('transform').replace(/translate\(.*?\)/, '')}translate(${gDomTransX}, ${gDomTransY})`;
        this.gDomTransform = transform;
        this.gDom.setAttribute('transform', transform);
      }
      const mouseupCb = (e) => {
        document.removeEventListener('mouseup', mouseupCb);
        document.removeEventListener('mousemove', mousemoveCb);
      }

      document.addEventListener('mouseup', mouseupCb);
      document.addEventListener('mousemove', mousemoveCb);
    }

    this.rootDom.addEventListener('click', this.clickCb); 
    this.rootDom.addEventListener('mousedown', this.dragCb); 
    this.rootDom.addEventListener('mousewheel', this.mousewheelCb);
  }

  componentWillReceiveProps(nextProps) {
    // props中有很多其他的如loading参数会导致更新
    const machineData = nextProps.machineData;
    const root = machineData.content;

    // 必须有有效content数据才渲染
    if (root && machineData !== this.props.machineData) {
      const options = {
        root,
        boxDom: this.rootDom,
        gDomTransform: this.gDomTransform,
        width: this.rootDom.clientWidth,
        height: this.rootDom.clientHeight,
        handleState: this.handleState,
        handleRelation: this.handleRelation,
      };
      drawMachine(options);
      this.machineData = machineData.originData;
      this.gDom = this.rootDom.querySelector('g'); // 等待machine绘制完毕时获得g的dom对象
    }
  }

  componentWillUnmount () {
    this.rootDom.removeEventListener('click', this.clickCb);
    this.rootDom.removeEventListener('mousedown', this.dragCb);
    this.rootDom.removeEventListener('mousewheel', this.mousewheelCb);
  }

  render() {
    const {
      confirmLoading,
      fields
    } = this.props;
    const aStyle = {
      display: 'block',
      width: 0,
      height: 0
    };
    const modalProps = {
      operateType: 'add',
      confirmLoading,
      fields,
      visible: this.state.visible,
      onOk: (param) => this.handleSaveState(param),
    };

    return (
      <div 
        style={{ minHeight: 'calc(100vh - 110px)' }}
        className={style.root}
        ref={ref => this.rootDom = ref}
      >

        {/* 点击删除关系时弹窗 */}
          <Popconfirm 
            title="Are you sure delete this task?" 
            onConfirm={this.handleConfirmDeleteRelation} 
            okText="Yes" 
            cancelText="No"
          >
            <a 
              style={aStyle}
              href="#"
              ref={ref => this.delRelationDom = ref}
            ></a>
          </Popconfirm>

        {/* 点击状态时弹窗 */}
          <Popconfirm 
            title="choose your next action!" 
            onConfirm={this.handleCreateState} 
            onCancel={this.handleDeleteState}
            okText="创建状态" 
            cancelText="删除状态"
          >
            <a 
              style={aStyle}
              href="#"
              ref={ref => this.delStateDom = ref}
            ></a>
          </Popconfirm>

        {/* 删除状态时弹窗 */}
          <Popconfirm 
            title="Are you sure delete this task?" 
            onConfirm={this.handleConfirmDeleteState} 
            okText="Yes" 
            cancelText="No"
          >
            <a 
              style={aStyle}
              href="#"
              ref={ref => this.comfirmDelStateDom = ref}
            ></a>
          </Popconfirm>

        {/* 新增状态时弹窗 */}
        <StateModal {...modalProps} />
        
      </div>
    );
  }
}

export default CreateMachine;
