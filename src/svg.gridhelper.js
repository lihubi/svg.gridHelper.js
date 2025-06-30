import { Svg, SVG, extend } from "@svgdotjs/svg.js";

class GridHelper {
  draw;
  options;
  gridGroup;
  labelGroup;
  visible;
  labelTemplate;
  parentDraw;
  constructor(parentDraw, options) {
    this.parentDraw = parentDraw; // 保存父绘图引用

    // 创建一个新的 SVG DOM 并添加到父容器中
    const parentDom = parentDraw.node.parentNode;
    const width = parentDraw.width();
    const height = parentDraw.height();
    // parentDom设置position为relative
    parentDom.style.position = "relative";
    this.draw = SVG().addTo(parentDom).size(width, height).css({
      position: "absolute",
      top: "0",
      left: "0",
      "z-index": "1", // 确保在父元素之上
      "pointer-events": "none", // 穿透交互事件
    });

    // 默认配置
    this.options = Object.assign(
      {
        gridSize: 100,
        minPixels: 100,
        gridColor: "gray",
        labelColor: "#666",
        gridStrokeWidth: 1,
        labelFontSize: 12,
        showLabel: true,
      },
      options
    );

    // 创建标签模板
    this.labelTemplate = this.draw.text("").hide();

    // 创建网格和标签组
    this.gridGroup = this.draw.group();
    this.labelGroup = this.draw.group();

    // 初始网格状态
    this.visible = true;

    // 初始化网格
    this.update();

    //   setInterval(() => {
    //     this.update();
    //   }, 200);
  }

  // 计算合适的网格间距
  calculateGridSize() {
    const zoom = this.draw.zoom();
    const minPixels = this.options.minPixels;
    const baseGridSize = this.options.gridSize;

    // 根据缩放级别调整网格间距
    let gridSize = baseGridSize;
    while (gridSize * zoom < minPixels) {
      gridSize *= 2;
    }
    while (gridSize * zoom > minPixels * 2) {
      gridSize /= 2;
    }

    return Math.max(gridSize, 5); // 确保最小网格尺寸
  }

  // 更新网格和标签
  update() {
    // 清除旧的网格和标签
    this.gridGroup.clear();

    if (!this.visible) return;

    // 从 parentDraw 获取同步参数
    const zoom = this.parentDraw.zoom();
    const viewbox = this.parentDraw.viewbox();

    // 使用 parentDraw 的 viewbox 设置当前 draw
    this.draw.viewbox(viewbox.x, viewbox.y, viewbox.width, viewbox.height);
    this.draw.zoom(zoom);

    const gridSize = this.calculateGridSize();

    // 获取当前视口位置
    const viewX = viewbox.x;
    const viewY = viewbox.y;
    const viewWidth = viewbox.width;
    const viewHeight = viewbox.height;

    // 计算网格起点和终点
    const startX = (Math.floor(viewX / gridSize) - 5) * gridSize;
    const endX = (Math.ceil((viewX + viewWidth) / gridSize) + 5) * gridSize;
    const startY = (Math.floor(viewY / gridSize) - 5) * gridSize;
    const endY = (Math.ceil((viewY + viewHeight) / gridSize) + 5) * gridSize;

    // 绘制网格线
    for (let x = startX; x <= endX; x += gridSize) {
      this.gridGroup.line(x, startY, x, endY).stroke({
        width: this.options.gridStrokeWidth / zoom,
        color: this.options.gridColor,
        opacity: 0.7,
      });
    }

    for (let y = startY; y <= endY; y += gridSize) {
      this.gridGroup.line(startX, y, endX, y).stroke({
        width: this.options.gridStrokeWidth / zoom,
        color: this.options.gridColor,
        opacity: 0.7,
      });
    }

    // 绘制刻度标签
    if (this.options.showLabel) {
      this.drawLabels(gridSize, viewX, viewY, viewWidth, viewHeight);
    }
  }

  // 绘制标签
  drawLabels(gridSize, viewX, viewY, viewWidth, viewHeight) {
    const labelFontSize = this.options.labelFontSize;

    // 创建标签缓存对象
    const existingLabels = new Map();
    this.labelGroup.children().forEach((label) => {
      const position = label.attr("position");
      const key = `${position}-${label.text()}`;
      existingLabels.set(key, label);
    });

    // 创建/更新标签的公共方法
    const updateOrCreateLabel = (
      text,
      x,
      y,
      anchor,
      baseline,
      fontSize,
      position
    ) => {
      const key = `${position}-${text}`;
      if (existingLabels.has(key)) {
        const label = existingLabels.get(key);
        label.font("size", fontSize).move(x, y);
        existingLabels.delete(key); // 标记为已使用
      } else {
        this.createLabel(text, x, y, anchor, baseline, fontSize, position);
      }
    };

    // 计算网格起点和终点
    const startX = (Math.floor(viewX / gridSize) - 5) * gridSize;
    const endX = (Math.ceil((viewX + viewWidth) / gridSize) + 5) * gridSize;
    const startY = (Math.floor(viewY / gridSize) - 5) * gridSize;
    const endY = (Math.ceil((viewY + viewHeight) / gridSize) + 5) * gridSize;

    //根据zoom缩放文字大小
    const zoom = this.draw.zoom();
    const scale = 1 / zoom;
    // const fontSize = labelFontSize * scale; //设置字体大小
    const fontSize = labelFontSize * scale; //设置字体大小
    const singleNumberWidth = this.getNumberWidth();

    // 上边缘标签
    for (let x = startX; x <= endX; x += gridSize) {
      const screenX = x;
      const textWidth = x.toString().length * singleNumberWidth;
      // this.createLabel(x.toString(), screenX - textWidth / 2, viewY, 'middle', 'auto', fontSize);
      updateOrCreateLabel(
        x.toString(),
        screenX - textWidth / 2,
        viewY,
        "middle",
        "auto",
        fontSize,
        "top"
      );
    }

    // // 下边缘标签
    for (let x = startX; x <= endX; x += gridSize) {
      const screenX = x;
      const textWidth = x.toString().length * singleNumberWidth;
      // this.createLabel(x.toString(), screenX - textWidth / 2, viewHeight - fontSize + viewY, 'middle', 'auto', fontSize);
      updateOrCreateLabel(
        x.toString(),
        screenX - textWidth / 2,
        viewHeight - fontSize + viewY,
        "middle",
        "auto",
        fontSize,
        "bottom"
      );
    }

    // 左边缘标签
    for (let y = startY; y <= endY; y += gridSize) {
      const screenY = y;
      // this.createLabel(y.toString(), viewX, screenY - fontSize / 2, 'start', 'middle', fontSize);
      updateOrCreateLabel(
        y.toString(),
        viewX,
        screenY - fontSize / 2,
        "start",
        "middle",
        fontSize,
        "left"
      );
    }

    // 右边缘标签
    for (let y = startY; y <= endY; y += gridSize) {
      const screenY = y;
      const textWidth = y.toString().length * singleNumberWidth;
      // this.createLabel(y.toString(), viewWidth + viewX - textWidth, screenY - fontSize / 2, 'end', 'middle', fontSize);
      updateOrCreateLabel(
        y.toString(),
        viewX + viewWidth - textWidth,
        screenY - fontSize / 2,
        "end",
        "middle",
        fontSize,
        "right"
      );
    }

    // 删除未使用的旧标签
    existingLabels.forEach((label) => label.remove());
  }

  // 创建标签元素
  createLabel(text, x, y, anchor, baseline, fontSize, position) {
    const label = this.labelTemplate
      .clone()
      .text(text)
      .font({
        size: fontSize,
        family: "Arial, sans-serif",
      })
      .fill(this.options.labelColor)
      .attr({
        "text-anchor": anchor,
        "dominant-baseline": baseline,
        "pointer-events": "none",
        style: "user-select: none;",
        position,
      })
      .move(x, y)
      .show();

    this.labelGroup.add(label);

    // 将标签置于背景之上
    label.front();
  }

  // 显示/隐藏网格
  toggle(visible) {
    if (visible !== undefined) {
      this.visible = visible;
    } else {
      this.visible = !this.visible;
    }

    if (this.visible) {
      this.gridGroup.show();
      this.labelGroup.show();
      this.update();
    } else {
      this.gridGroup.hide();
      this.labelGroup.hide();
    }
  }

  // 更新配置
  updateOptions(options) {
    Object.assign(this.options, options);
    this.update();
  }

  //计算单个数字宽度
  getNumberWidth() {
    //根据zoom缩放文字大小
    const zoom = this.draw.zoom();
    const scale = 1 / zoom;
    const labelFontSize = this.options.labelFontSize;
    const fontSize = labelFontSize * scale; //设置字体大小
    // 创建临时文本测量
    const tempText = this.labelTemplate
      .clone()
      .text('0')
      .font({
        size: fontSize,
        family: "Arial, sans-serif",
      })

    const bbox = tempText.bbox();
    
    // 立即移除临时元素
    tempText.remove();
    return bbox.width;
  }

  resize() {
    // 获取父容器最新尺寸
    const width = this.parentDraw.width();
    const height = this.parentDraw.height();

    // 更新当前绘图尺寸
    this.draw.size(width, height);

    // 触发网格更新
    this.update();
  }

  destroy() {
    this.gridGroup.remove();
    this.labelGroup.remove();
  }
}

extend(Svg, {
  gridHelper(options) {
    const gridHelper = new GridHelper(this, options);
    this.gridHelper = gridHelper;
    return this;
  },
});
