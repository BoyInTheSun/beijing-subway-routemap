# beijing-subway-routemap

动态可视化展示北京地铁运行图。

## 在线展示网站

[bjsubway.boyinthesun.cn](https://bjsubway.boyinthesun.cn)

## 时刻表数据

时刻表数据的精度是分钟，并且忽略在站经停时间。故即便该时刻表准确，仍会存在一分钟左右的误差。

该时刻表区分了节假日和工作日，但现实中的某些情况也许会执行特殊时刻表，或者因运行图调整、恶劣天气、活动保障、突发故障等原因导致与时刻表不符。出于上述原因，该项目仅作为动画演示，对于任何和现实世界有出入之处不负任何责任。

关于数据的来源于和许可证见[关于许可证-数据](#数据)

## 地图数据

地图数据来源于[北京地铁线路图](https://map.bjsubway.com/)。版权归原作者所有。

该地图是变形地图，两站间距离可能不符合现实比例，故动画中某些区间列车的速度突然变快或变慢。

## 如何贡献

如果你对前端设计或代码逻辑等有建议，或发现bug，请提issue。

如果你能对时刻表数据和地图数据提供帮助，请提issue。或贡献项目[beijing-subway-schedule](https://github.com/BoyInTheSun/beijing-subway-schedule)和[Beijing-Subway-Tools](https://github.com/Mick235711/Beijing-Subway-Tools)。

请注意，请勿在未授权情况下提供任何内部数据。

## TODO

大体按照优先程度由高到低排序

### 问题修复

+ 线路选择滚轮不可用，按住拖拽不应选择
+ 17号线南无车
+ 14号线方庄异常
+ 6号线跨线列车优化，待避列车方向以及跨站列车高亮
+ 房山线、9号线跨站列车

### 功能增改

+ 虚拟换乘、暂缓开通站图标
+ 暂缓开通站时刻表
+ 点击站点展示到站列车情况
+ 点击列车展示经停站情况
+ 亦庄T1线数据
+ 多语言（繁体中文、英文）

## 关于许可证

本项目采用多重许可证，基于内容的性质和用途。请仔细阅读项目根目录的 [LICENSE](./LICENSE) 文件获取完整法律条款和详细规则说明。

### 代码部分

**适用条件**：除文件[`wwwroot/data/schedule.json`](wwwroot/data/schedule.json)外，所有用于构建、运行、生成或控制本项目演示内容的功能性元素，包括但不限于：源代码文件（如 .py, .js, .html , .css 等）、脚本等。

**适用许可证**：Mozilla Public License 2.0 (MPL-2.0)

**核心要求**：可自由复制使用修改。**分发修改版本时，必须开源对代码文件的修改，并保留所有原始版权和许可证声明（包括下文提到关于数据和演示内容的声明）**。允许与闭源代码组合。

[查看 MPL-2.0 全文](./LICENSE-MPL) | [官方原文](https://www.mozilla.org/en-US/MPL/2.0/)

### 数据

**适用条件**：文件[`wwwroot/data/schedule.json`](wwwroot/data/schedule.json)。

**适用许可证**：Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

**核心要求**：可自由分享、改编。**使用时必须署名（注明原作者/来源），并以相同许可证（CC BY-SA 4.0）共享您的演绎作品**。此举是为了严格遵守引用项目的许可证。

**来源**：本作者另一项目[beijing-subway-schedule](https://github.com/BoyInTheSun/beijing-subway-schedule)和[@Mick235711](https://github.com/Mick235711)的[Beijing-Subway-Tools](https://github.com/Mick235711/Beijing-Subway-Tools)。感谢[@Mick235711](https://github.com/Mick235711)提供数据和适用于本项目格式的接口。

[查看 CC BY-SA 4.0 全文](./LICENSE-CC-BY-SA) | [官方原文](https://creativecommons.org/licenses/by-sa/4.0/legalcode.zh-hans) | [通俗摘要](https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans)

### 演示内容

**适用许可证**：Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

**适用条件**：所有通过本项目展示或生成的最终呈现形式，包括但不限于：网页的视觉与布局渲染、动画的最终可视化效果、文本内容、设计元素等。

**核心要求**：可自由分享、改编。**使用时必须署名（注明原作者/来源），并以相同许可证（CC BY-SA 4.0）共享您的演绎作品**。该作品的衍生作品包括但不限于：对于本作品的视频录制、剪辑、截图等。署名的方式可以是作者（BoyInTheSun）、演示地址（https://bjsubway.boyinthesun.cn/）、项目地址（https://github.com/BoyInTheSun/beijing-subway-routemap）。

[查看 CC BY-SA 4.0 全文](./LICENSE-CC-BY-SA) | [官方原文](https://creativecommons.org/licenses/by-sa/4.0/legalcode.zh-hans) | [通俗摘要](https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans)
