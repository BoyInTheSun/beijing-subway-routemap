# beijing-subway-routemap

动态可视化展示北京地铁运行图。该项目使用真实的地铁时刻表数据，通过动画形式展示列车在各地铁线路上的运行状态。支持线路选择、时间控制、播放速度调节等功能，为用户提供直观的地铁运行可视化体验。

## 在线展示网站

[bjsubway.boyinthesun.cn](https://bjsubway.boyinthesun.cn)

## 地图数据

地图数据来源于[北京地铁线路图](https://map.bjsubway.com/)。版权归原作者所有。

该地图是变形地图，两站间距离可能不符合现实比例。

## 时刻表数据

时刻表数据的精度是分钟，并且忽略在站经停时间。区分节假日和工作日。

关于数据的来源于和许可证见[关于许可证-数据](#数据)

## 技术栈

纯 JavaScript，绘图使用 svg 标签，动画使用 animate 和 animateMotion 标签。

d3用于重载svg。

## 计划列表

见[todo_list.json](./wwwroot/data/todo_list.json)

## 更新记录

见[version.json](./wwwroot/data/version.json)

## 如何贡献

如果你对前端设计或代码逻辑等有建议，或发现bug，请提issue。

如果你能对时刻表数据和地图数据提供帮助，请提issue。或贡献项目[beijing-subway-schedule](https://github.com/BoyInTheSun/beijing-subway-schedule)和[Beijing-Subway-Tools](https://github.com/Mick235711/Beijing-Subway-Tools)。

请注意，请勿在未授权情况下提供任何内部数据。

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

**来源**：本作者另一项目[beijing-subway-schedule](https://github.com/BoyInTheSun/beijing-subway-schedule)和[@Mick235711](https://github.com/Mick235711)的[Beijing-Subway-Tools](https://github.com/Mick235711/Beijing-Subway-Tools)。

[查看 CC BY-SA 4.0 全文](./LICENSE-CC-BY-SA) | [官方原文](https://creativecommons.org/licenses/by-sa/4.0/legalcode.zh-hans) | [通俗摘要](https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans)

### 演示内容

**适用许可证**：Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)

**适用条件**：所有通过本项目展示或生成的最终呈现形式，包括但不限于：网页的视觉与布局渲染、动画的最终可视化效果、文本内容、设计元素等。

**核心要求**：可自由分享、改编。**使用时必须署名（注明原作者/来源），并以相同许可证（CC BY-SA 4.0）共享您的演绎作品**。该作品的衍生作品包括但不限于：对于本作品的视频录制、剪辑、截图等。署名的方式可以是作者（BoyInTheSun）、演示地址（https://bjsubway.boyinthesun.cn/）、项目地址（https://github.com/BoyInTheSun/beijing-subway-routemap）。

[查看 CC BY-SA 4.0 全文](./LICENSE-CC-BY-SA) | [官方原文](https://creativecommons.org/licenses/by-sa/4.0/legalcode.zh-hans) | [通俗摘要](https://creativecommons.org/licenses/by-sa/4.0/deed.zh-hans)

# 感谢

感谢[@Mick235711](https://github.com/Mick235711)提供数据和适用于本项目格式的接口。

感谢[@EchoGitH](https://github.com/EchoGitH)为前端设计做出贡献。
