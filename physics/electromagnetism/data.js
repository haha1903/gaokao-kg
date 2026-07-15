// 电磁学知识图谱 — 知识点节点数据
// schema:
//   id        唯一标识(kebab-case),边用它引用
//   title     知识点名
//   layer     basic|electric|magnetic|induction
//   oneLine   一句话定义(卡片顶部 + 图谱)
//   body      HTML 正文;公式用 MathJax。注意:JS 字符串里 LaTeX 反斜杠必须双写 \\
//   edges     [{to, type}]  串联关系;type: 相互作用|定义|决定式|特例|逆用|做功|桥接|激发|反作用|提供|应用|统一
//   sources   [{label, href}]
//   coverage  ok=高考主干 | partial=冲满分拓展

window.KG_LAYERS = [
  { id:"basic",     label:"基本概念",     color:"#5eead4", desc:"场的观点与电荷 — 一切的起点" },
  { id:"electric",  label:"电场",         color:"#38bdf8", desc:"静电场:一条从力到能的推导链" },
  { id:"magnetic",  label:"磁场",         color:"#fb7185", desc:"磁场:洛伦兹力如何逼出匀速圆周" },
  { id:"induction", label:"电磁感应·统一", color:"#a78bfa", desc:"磁通变化生电,电与磁的统一" },
];

const SRC = [{ label:"静态总览图 · 六维度架构", href:"assets/overview.svg" }];

window.KG_NODES = [

// ==================== 基本概念 ====================
{
  id:"field-view", title:"场的观点", layer:"basic", coverage:"ok",
  oneLine:"电荷不隔空直接作用,而是先在周围空间激发『电场』,场再对其中的电荷施力。",
  body:`
    <p>这是理解整个电磁学的<b>思想地基</b>。两个电荷之间的作用,不是"超距"瞬间传递,而是分两步:</p>
    <ul>
      <li>电荷 A 在周围空间<b>激发一个电场</b>(场是一种看不见但真实存在的物质);</li>
      <li>电荷 B 处在这个场里,<b>受到场的力</b>。</li>
    </ul>
    <p>这样"力"就被拆成了"<b>源电荷 → 场 → 受力电荷</b>"。之所以要引入场,是因为它能作为<b>空间本身的属性</b>被独立描述(见「电场强度」),而不必每次都提到另一个电荷。</p>
    <blockquote>场是矢量场:每一点都有大小和方向;多个源产生的场按矢量叠加。</blockquote>
  `,
  edges:[ {to:"charge",type:"相互作用"}, {to:"coulomb",type:"呼应"}, {to:"field-strength",type:"定义"} ],
  sources:SRC,
},
{
  id:"charge", title:"电荷 · 守恒 · 元电荷", layer:"basic", coverage:"ok",
  oneLine:"自然界只有正负两种电荷;电荷守恒;最小单位是元电荷 e。",
  body:`
    <p>电荷是电磁现象的<b>源头</b>。</p>
    <ul>
      <li><b>两种电荷</b>:正、负。同性相斥,异性相吸。</li>
      <li><b>元电荷</b> $e = 1.6\\times10^{-19}\\ \\mathrm{C}$,任何带电体的电荷量都是 e 的整数倍(电荷量子化)。</li>
      <li><b>电荷守恒定律</b>:电荷既不能创造也不能消灭,只能转移。起电三方式:摩擦、接触、感应,本质都是电子的转移。</li>
    </ul>
  `,
  edges:[ {to:"coulomb",type:"相互作用"}, {to:"field-view",type:"激发"} ],
  sources:SRC,
},

// ==================== 电场 ====================
{
  id:"coulomb", title:"库仑定律", layer:"electric", coverage:"ok",
  oneLine:"真空中两点电荷的相互作用力 F=kq₁q₂/r²,是全部电学的地基。常数 k 藏着真空介电常数 ε₀。",
  body:`
    <h4>基本表达式</h4>
    <p>$$F = k\\dfrac{q_1 q_2}{r^2}$$</p>
    <p>方向沿两电荷连线,同性相斥、异性相吸。<b>适用条件:真空中的点电荷</b>(或均匀带电球,用球心间距)。</p>
    <h4>静电力常量 k</h4>
    <p>$k = 8.99\\times10^{9}\\ \\mathrm{N\\cdot m^2/C^2}$(常近似 $9\\times10^9$)。</p>
    <h4>k 与真空介电常数 ε₀ 的关系 <span style="color:#fbbf24">⭐拓展</span></h4>
    <p>常量 k 并不是凭空来的,它由<b>真空介电常数</b> $\\varepsilon_0$ 决定:</p>
    <p>$$k = \\dfrac{1}{4\\pi\\varepsilon_0}\\,,\\qquad \\varepsilon_0 \\approx 8.85\\times10^{-12}\\ \\mathrm{C^2/(N\\cdot m^2)}$$</p>
    <p>所以库仑定律也常写成 $F=\\dfrac{q_1 q_2}{4\\pi\\varepsilon_0 r^2}$。那个 $4\\pi$ 来自"点电荷的场向四面八方均匀铺开"(球面积 $4\\pi r^2$)。</p>
    <h4>介质中的库仑力 · 相对介电常数 εᵣ <span style="color:#fbbf24">⭐拓展</span></h4>
    <p>若两电荷不在真空而在某种介质中,力会<b>减弱</b>:</p>
    <p>$$F = \\dfrac{q_1 q_2}{4\\pi\\varepsilon r^2}\\,,\\qquad \\varepsilon = \\varepsilon_0\\,\\varepsilon_r$$</p>
    <ul>
      <li>$\\varepsilon$:介质的<b>(绝对)介电常数</b>;</li>
      <li>$\\varepsilon_r$:<b>相对介电常数</b>(相对于真空的倍数),$\\varepsilon_r>1$;</li>
      <li>介质让力变为真空中的 $1/\\varepsilon_r$ 倍(例如水 $\\varepsilon_r\\approx80$,力骤减)。</li>
    </ul>
    <blockquote>这条常数链把:库仑力 → k → ε₀ → 介质 εᵣ 串成了一条完整脉络,也解释了后面电容器公式里为什么会冒出 ε。</blockquote>
  `,
  edges:[ {to:"charge",type:"相互作用"}, {to:"field-strength",type:"定义"}, {to:"point-field",type:"决定式"}, {to:"capacitor",type:"影响"} ],
  sources:SRC,
},
{
  id:"field-strength", title:"电场强度 E=F/q", layer:"electric", coverage:"ok",
  oneLine:"用试探电荷定义场的强弱:E=F/q,与试探电荷无关,是描述电场『力』属性的矢量。",
  body:`
    <h4>定义式(普适)</h4>
    <p>$$E = \\dfrac{F}{q}$$</p>
    <p>把一个<b>试探电荷</b> q 放到场中某点,测它受的力 F,比值 $F/q$ 就是该点场强。关键:这个比值<b>与 q 无关</b>(q 大力也大),所以它反映的是<b>场本身</b>在这一点的性质。</p>
    <ul>
      <li><b>矢量</b>,方向 = 正电荷在该点的受力方向;单位 $\\mathrm{N/C}$。</li>
      <li>这是"比值定义法"的典范(和后面 $B=F/(IL)$ 同一思路)。</li>
    </ul>
    <h4>三个 E 公式的分工(别混!)</h4>
    <table>
      <tr><th>公式</th><th>身份</th><th>适用</th></tr>
      <tr><td>$E=F/q$</td><td>定义式</td><td>任何电场,普适</td></tr>
      <tr><td>$E=kQ/r^2$</td><td>决定式</td><td>点电荷 Q 产生的场</td></tr>
      <tr><td>$E=U/d$</td><td>关系式</td><td>仅匀强场,连接电势</td></tr>
    </table>
    <p>定义式说"怎么测",决定式说"由谁产生、有多大",关系式说"和电势怎么换算"。</p>
  `,
  edges:[ {to:"coulomb",type:"定义自"}, {to:"point-field",type:"决定式"}, {to:"uniform-field",type:"特例"}, {to:"field-line",type:"表示"}, {to:"electric-force",type:"逆用"} ],
  sources:SRC,
},
{
  id:"point-field", title:"点电荷场 E=kQ/r²", layer:"electric", coverage:"ok",
  oneLine:"点电荷 Q 在距离 r 处激发的场强,是『决定式』——由源电荷和位置决定。",
  body:`
    <p>把库仑定律 $F=k\\dfrac{Qq}{r^2}$ 除以试探电荷 q,q 消掉,得到点电荷自己产生的场:</p>
    <p>$$E = k\\dfrac{Q}{r^2} = \\dfrac{Q}{4\\pi\\varepsilon_0 r^2}$$</p>
    <p>其中静电力常量 $k = 8.99\\times10^{9}\\ \\mathrm{N\\cdot m^2/C^2}$(常近似 $9\\times10^9$),真空介电常数 $\\varepsilon_0 \\approx 8.85\\times10^{-12}\\ \\mathrm{C^2/(N\\cdot m^2)}$。</p>
    <ul>
      <li>方向:正源电荷沿径向<b>向外</b>,负源电荷沿径向<b>向内</b>;</li>
      <li>它是<b>决定式</b>:E 由源电荷 Q 和距离 r 决定,和有没有试探电荷无关;</li>
      <li>与定义式 $E=F/q$ 的区别:$E=F/q$ 是"怎么测量任意场",$E=kQ/r^2$ 是"点电荷这一具体场有多大"。</li>
    </ul>
  `,
  edges:[ {to:"coulomb",type:"决定式"}, {to:"field-strength",type:"是"}, {to:"field-line",type:"表示"} ],
  sources:SRC,
},
{
  id:"field-line", title:"电场线 · 叠加原理", layer:"electric", coverage:"ok",
  oneLine:"形象描述场:切线定方向、疏密定强弱;多个源的场按矢量叠加。",
  body:`
    <h4>电场线</h4>
    <ul>
      <li>某点的<b>切线方向</b> = 该点场强方向;<b>疏密</b> = 场强大小。</li>
      <li>始于正电荷、终于负电荷(或无穷远),<b>不闭合、不相交</b>。</li>
      <li><b>匀强电场</b>的电场线是一族<b>平行且等距</b>的直线(如平行板内部)。</li>
    </ul>
    <h4>叠加原理</h4>
    <p>多个电荷共同产生的场,等于各电荷单独产生的场的<b>矢量和</b>:$\\vec{E}=\\vec{E_1}+\\vec{E_2}+\\cdots$。这让复杂电荷系统的场可以拆解计算。</p>
  `,
  edges:[ {to:"field-strength",type:"表示"}, {to:"uniform-field",type:"特例"} ],
  sources:SRC,
},
{
  id:"uniform-field", title:"匀强电场 & E=U/d", layer:"electric", coverage:"ok",
  oneLine:"匀强场中 E=U/d,它把『力的场强 E』和『能的电势差 U』直接扣在一起——最容易被讲薄的一条。",
  body:`
    <h4>什么是匀强电场</h4>
    <p>大小、方向<b>处处相同</b>的电场(典型:平行板电容器内部,忽略边缘)。电场线平行、等距。</p>
    <h4>核心关系式</h4>
    <p>$$E = \\dfrac{U}{d}$$</p>
    <p><b>这个式子只对匀强场成立</b>,而且 <b>d 必须是沿电场方向的两点间距离</b>(不是任意方向、不是极板任意间距)。</p>
    <h4>它是怎么来的(推导)</h4>
    <p>在匀强场中,电场力 $F=qE$ 恒定。把电荷沿场方向移动距离 d:</p>
    <ul>
      <li>从"能"看,做功 $W=qU$;</li>
      <li>从"力"看,做功 $W=Fd=qEd$;</li>
      <li>两者相等 $\\Rightarrow qU=qEd \\Rightarrow U=Ed \\Rightarrow E=\\dfrac{U}{d}$。</li>
    </ul>
    <h4>为什么两种场强单位是一样的</h4>
    <p>由 $E=F/q$ 得单位 $\\mathrm{N/C}$;由 $E=U/d$ 得单位 $\\mathrm{V/m}$。它们<b>数值和量纲完全等价</b>:$\\mathrm{V/m}=\\mathrm{N/C}$。同一个"场强",一个从力定义、一个从能定义,殊途同归。</p>
    <h4>更深的物理意义 <span style="color:#fbbf24">⭐拓展</span></h4>
    <p>$E=U/d$ 说明:<b>场强 = 电势沿电场方向的变化率</b>(即电势的空间梯度)。所以 <b>E 总是指向电势降低最快的方向</b>,大小等于"每米电势掉多少伏"。这为大学的 $\\vec{E}=-\\nabla\\varphi$ 埋下伏笔。</p>
    <blockquote>一句话:E=U/d 是电场里"力的语言(E)"和"能的语言(U)"之间的汇率。</blockquote>
  `,
  edges:[ {to:"field-strength",type:"特例"}, {to:"potential",type:"桥接"}, {to:"work-energy",type:"推导"}, {to:"mag-apps",type:"应用"} ],
  sources:SRC,
},
{
  id:"electric-force", title:"电场力 F=qE", layer:"electric", coverage:"ok",
  oneLine:"已知场求力:F=qE。正电荷沿E、负电荷逆E;电荷静止也照样受力。",
  body:`
    <p>$$F = qE$$</p>
    <p>这是 $E=F/q$ 的<b>逆用</b>:知道了某点场强 E,任何电荷 q 放上去就受力 $qE$。</p>
    <ul>
      <li>正电荷受力方向<b>沿 E</b>,负电荷<b>逆 E</b>;</li>
      <li><b>与运动无关:静止电荷也受力</b>(这正是它和洛伦兹力最本质的区别——洛伦兹力要求电荷运动)。</li>
    </ul>
  `,
  edges:[ {to:"field-strength",type:"逆用"}, {to:"work-energy",type:"做功"}, {to:"motion-e",type:"提供"}, {to:"lorentz",type:"对比"} ],
  sources:SRC,
},
{
  id:"work-energy", title:"电场力做功 W=qU", layer:"electric", coverage:"ok",
  oneLine:"W=qU,只由起终点电势差决定、与路径无关 ⟹ 电场力是保守力(能量枢纽)。",
  body:`
    <p>$$W_{AB} = qU_{AB} = q(\\varphi_A - \\varphi_B)$$</p>
    <ul>
      <li><b>与路径无关</b>,只取决于起点和终点的电势差;</li>
      <li>这正是"<b>保守力</b>"的判据 —— <b>有保守力,才能定义势能</b>。这一步是从"力的描述(E)"跨到"能的描述(φ、U)"的<b>枢纽</b>。</li>
      <li>匀强场里 $W=qEd$(d 沿场方向)。</li>
    </ul>
  `,
  edges:[ {to:"electric-force",type:"做功"}, {to:"potential-energy",type:"定义势能"}, {to:"uniform-field",type:"推导"} ],
  sources:SRC,
},
{
  id:"potential-energy", title:"电势能 Ep=qφ", layer:"electric", coverage:"ok",
  oneLine:"因电场力保守而定义的势能:Ep=qφ;电场力做功 = 电势能减少。",
  body:`
    <p>$$E_p = q\\varphi\\,,\\qquad W_{AB} = E_{pA} - E_{pB}$$</p>
    <ul>
      <li>电场力做正功,电势能减少(类比重力做功与重力势能);</li>
      <li>正电荷从高电势到低电势,电场力做正功,$E_p$ 减小;负电荷相反;</li>
      <li>$E_p$ 的正负要连同 q 的正负一起判断。</li>
    </ul>
  `,
  edges:[ {to:"work-energy",type:"定义自"}, {to:"potential",type:"定义"} ],
  sources:SRC,
},
{
  id:"potential", title:"电势 φ / 电势差 U / 等势面", layer:"electric", coverage:"ok",
  oneLine:"电势φ描述场的『能』属性(φ=Ep/q);电势差 U=φA−φB;等势面⊥电场线。",
  body:`
    <p>$$\\varphi = \\dfrac{E_p}{q}\\,,\\qquad U_{AB} = \\varphi_A - \\varphi_B$$</p>
    <ul>
      <li>电势 φ 是<b>标量</b>,只有大小正负,描述场的"能"属性(与描述"力"的矢量 E 互补);</li>
      <li>沿电场线方向,电势<b>降低</b>;</li>
      <li><b>等势面</b>:电势相等的面,总是<b>垂直于电场线</b>;沿等势面移动电荷,电场力<b>不做功</b>。</li>
    </ul>
  `,
  edges:[ {to:"potential-energy",type:"定义自"}, {to:"uniform-field",type:"桥接"}, {to:"work-energy",type:"决定"} ],
  sources:SRC,
},
{
  id:"motion-e", title:"带电粒子在电场中运动", layer:"electric", coverage:"ok",
  oneLine:"沿场→匀变速直线;垂直入场→类平抛。示波器偏转的原理。",
  body:`
    <ul>
      <li><b>沿场方向进入</b>:匀变速直线运动;加速过程 $qU=\\tfrac12 mv^2$(动能定理)。</li>
      <li><b>垂直场方向进入匀强场</b>:类平抛。沿初速方向匀速、沿场方向匀加速,轨迹为抛物线。</li>
      <li>处理套路:<b>分解</b>为"沿场"和"垂直场"两个方向分别用运动学。</li>
      <li>应用:示波器的电子束偏转。</li>
    </ul>
  `,
  edges:[ {to:"electric-force",type:"受力"}, {to:"uniform-field",type:"依赖"}, {to:"capacitor",type:"应用"} ],
  sources:SRC,
},
{
  id:"capacitor", title:"电容器 C=Q/U", layer:"electric", coverage:"partial",
  oneLine:"储存电荷的元件:C=Q/U;平行板电容公式里就藏着介电常数 ε。",
  body:`
    <p>$$C = \\dfrac{Q}{U}$$</p>
    <p>电容 C 表示"存储电荷的本领",与 Q、U 无关(是元件属性)。</p>
    <h4>平行板电容器 <span style="color:#fbbf24">⭐拓展</span></h4>
    <p>$$C = \\dfrac{\\varepsilon S}{4\\pi k d} = \\dfrac{\\varepsilon_0 \\varepsilon_r S}{d}$$</p>
    <p>正极板面积 S 越大、间距 d 越小、介质 $\\varepsilon_r$ 越大,电容越大。<b>这里的 ε 正是库仑定律里那个介电常数</b>——常数链在此闭环。</p>
    <h4>动态分析(易错)</h4>
    <ul>
      <li><b>始终接电源</b>:U 不变。改 d 或介质,Q、E 随之变($E=U/d$)。</li>
      <li><b>充电后断开</b>:Q 不变。改 d,U 随之变,但 $E=U/d=Q/(\\varepsilon_0\\varepsilon_r S)$ 与 d 无关。</li>
    </ul>
  `,
  edges:[ {to:"potential",type:"依赖"}, {to:"uniform-field",type:"应用"}, {to:"coulomb",type:"共享ε"}, {to:"e-field-energy",type:"储能"} ],
  sources:SRC,
},
{
  id:"e-field-energy", title:"电场能", layer:"electric", coverage:"partial",
  oneLine:"电场本身储存能量:电容器储能 ½CU²;能量弥散在空间里,密度 ½ε₀E²。与磁场能完全对称。",
  body:`
    <h4>先分清:电场能 ≠ 电势能</h4>
    <ul>
      <li><b>电势能</b> $E_p=q\\varphi$:说的是"一个<b>电荷</b>在电场中"具有的能量;</li>
      <li><b>电场能</b>:说的是"<b>电场本身</b>"储存的能量——能量弥散在有场的空间里,不依附于某个电荷。</li>
    </ul>
    <p>两者是不同层次的概念,别混。这里讲的是后者。</p>
    <h4>电容器储能</h4>
    <p>给电容器充电,就是把能量以电场的形式存进两极板之间:</p>
    <p>$$W = \\dfrac{1}{2}CU^2 = \\dfrac{1}{2}QU = \\dfrac{Q^2}{2C}$$</p>
    <p>放电时这份能量被放出来(相机闪光灯、除颤仪都靠电容瞬间放能)。</p>
    <h4>能量密度:能量存在"场"里 <span style="color:#fbbf24">⭐拓展</span></h4>
    <p>更本质地看,能量不是存在极板上,而是<b>弥散在有电场的空间里</b>,单位体积存的能量(能量密度):</p>
    <p>$$u = \\dfrac{1}{2}\\varepsilon_0 E^2$$</p>
    <p>哪里电场 E 越强,那里存的能量越密。这说明<b>场是能量的携带者</b>,能量可以脱离电荷、独立存在于空间中。</p>
    <blockquote>它和磁场能 $\\tfrac12 LI^2$、$u=\\dfrac{B^2}{2\\mu_0}$ 完全对称——电容↔电感、E↔B。电磁波正是这两种场能在空间中交替储存、向前传播。</blockquote>
  `,
  edges:[ {to:"capacitor",type:"储能于"}, {to:"potential-energy",type:"区分"}, {to:"b-field-energy",type:"对称"}, {to:"em-unify",type:"传播"} ],
  sources:SRC,
},

// ==================== 磁场 ====================
{
  id:"mag-source", title:"磁场的源", layer:"magnetic", coverage:"ok",
  oneLine:"运动电荷/电流激发磁场;没有磁单极,所以磁感线闭合;方向用安培定则。",
  body:`
    <ul>
      <li><b>源</b>:运动电荷、电流(以及磁体,本质仍是分子电流)。静止电荷不产生磁场。</li>
      <li><b>无磁单极</b>:磁场没有"源头"和"尽头",所以<b>磁感线是闭合曲线</b>(区别于电场线的始正终负)。</li>
      <li><b>方向判定——安培定则(右手螺旋)</b>:直导线用右手握住,拇指指电流,四指绕向即磁场方向;螺线管拇指指 N 极。</li>
    </ul>
  `,
  edges:[ {to:"mag-B",type:"激发"}, {to:"lorentz",type:"作用于运动电荷"} ],
  sources:SRC,
},
{
  id:"mag-B", title:"磁感应强度 B / 磁通量 Φ", layer:"magnetic", coverage:"ok",
  oneLine:"B=F/(IL)描述磁场强弱(矢量);穿过面积的磁感线用磁通量 Φ=BS 衡量。",
  body:`
    <h4>磁感应强度 B</h4>
    <p>$$B = \\dfrac{F}{IL}$$</p>
    <p>借"通电导线受的力"来定义(比值定义法,和 $E=F/q$ 同思路):在 B⊥I 时,B 等于单位电流、单位长度导线受的安培力。<b>矢量</b>,单位<b>特斯拉 T</b>。</p>
    <h4>磁通量 Φ</h4>
    <p>$$\\Phi = BS$$</p>
    <p><b>标量</b>,表示穿过某面积 S 的磁感线"条数"(S 取与 B 垂直的面积)。它是后面电磁感应的主角——<b>Φ 一变,就生电</b>。</p>
  `,
  edges:[ {to:"mag-source",type:"定义自"}, {to:"ampere",type:"反作用"}, {to:"lorentz",type:"反作用"}, {to:"flux",type:"提供Φ"} ],
  sources:SRC,
},
{
  id:"ampere", title:"安培力 F=BIL", layer:"magnetic", coverage:"ok",
  oneLine:"磁场对通电导线的力,F=BIL,方向左手定则——电动机的原理。",
  body:`
    <p>$$F = BIL\\quad(B\\perp I)\\,,\\qquad \\text{一般}\\ F = BIL\\sin\\theta$$</p>
    <ul>
      <li><b>方向:左手定则</b>——磁感线穿手心,四指指电流,拇指指受力方向。</li>
      <li>应用:<b>电动机</b>、磁电式电表(把电流转成转动)。</li>
      <li>安培力<b>可以做功</b>(推动导线),实现电能↔机械能转化——这也是电磁感应中能量转化的另一面。</li>
    </ul>
  `,
  edges:[ {to:"mag-B",type:"由B决定"}, {to:"mag-apps",type:"应用"}, {to:"lorentz",type:"宏观表现"}, {to:"motional-emf",type:"对偶(电动/发电)"} ],
  sources:SRC,
},
{
  id:"lorentz", title:"洛伦兹力 F=qvB", layer:"magnetic", coverage:"ok",
  oneLine:"磁场对运动电荷的力,F=qvB,永远垂直速度 ⟹ 不做功,只改方向不改速率。",
  body:`
    <p>$$F = qvB\\quad(v\\perp B)\\,,\\qquad \\text{一般}\\ F = qvB\\sin\\theta$$</p>
    <ul>
      <li><b>方向:左手定则</b>(正电荷四指指 v 方向;负电荷相反)。</li>
      <li><b>必须运动</b>且速度有垂直磁场的分量才受力(和电场力"静止也受力"正相反)。</li>
      <li><b>关键因果:$F\\perp v$</b> ⟹ 洛伦兹力<b>永不做功</b> ⟹ 动能不变 ⟹ <b>速率不变,只改变方向</b>。</li>
      <li>它是安培力的<b>微观本质</b>(导线里大量运动电子受洛伦兹力的宏观合力 = 安培力)。</li>
    </ul>
  `,
  edges:[ {to:"mag-B",type:"由B决定"}, {to:"circular",type:"提供向心力"}, {to:"electric-force",type:"对比"}, {to:"mag-apps",type:"应用"} ],
  sources:SRC,
},
{
  id:"circular", title:"匀速圆周运动 r=mv/(qB)", layer:"magnetic", coverage:"ok",
  oneLine:"v⊥B时洛伦兹力当向心力,做匀速圆周;周期 T=2πm/(qB) 与速率无关!",
  body:`
    <h4>为什么是匀速圆周</h4>
    <p>洛伦兹力大小不变($v$ 不变)、方向始终垂直速度指向同一侧,这正好是匀速圆周的条件。于是它充当<b>向心力</b>:</p>
    <p>$$qvB = \\dfrac{mv^2}{r}$$</p>
    <h4>解出半径与周期</h4>
    <p>$$r = \\dfrac{mv}{qB}\\,,\\qquad T = \\dfrac{2\\pi m}{qB}$$</p>
    <ul>
      <li><b>周期 T 与速率 v、半径 r 都无关</b>,只由比荷 $q/m$ 和 B 决定——这是回旋加速器能用固定频率持续加速的根本原因。</li>
      <li>比荷 $\\dfrac{q}{m}$ 是磁场问题的核心量。</li>
      <li>若 v 与 B 斜交:分解为 $v_\\parallel$(匀速)+ $v_\\perp$(圆周)→ 合成<b>螺旋线</b>。</li>
    </ul>
  `,
  edges:[ {to:"lorentz",type:"提供向心力"}, {to:"mag-apps",type:"应用"} ],
  sources:SRC,
},
{
  id:"mag-apps", title:"磁场应用:质谱仪/回旋加速器/速度选择器", layer:"magnetic", coverage:"ok",
  oneLine:"电场与磁场的联合应用;速度选择器 qE=qvB 是两个场的交汇点。",
  body:`
    <h4>速度选择器(电场 × 磁场交汇)</h4>
    <p>让电场力和洛伦兹力<b>方向相反、大小相等</b>:</p>
    <p>$$qE = qvB \\;\\Rightarrow\\; v = \\dfrac{E}{B}$$</p>
    <p>只有速度恰好 $v=E/B$ 的粒子受力平衡、直线通过,其余被偏转滤掉。这是电场和磁场"合作"的典型。</p>
    <h4>质谱仪</h4>
    <p>选速后进入纯磁场做圆周,$r=\\dfrac{mv}{qB}$,由 r 反推质量/比荷,用于分辨同位素。</p>
    <h4>回旋加速器 <span style="color:#fbbf24">⭐拓展</span></h4>
    <p>利用<b>T 与 v 无关</b>,用固定频率的交变电压在两个 D 形盒缝隙处一次次加速粒子,半径越转越大。</p>
  `,
  edges:[ {to:"circular",type:"依赖"}, {to:"lorentz",type:"依赖"}, {to:"ampere",type:"同类"}, {to:"uniform-field",type:"交汇(qE=qvB)"} ],
  sources:SRC,
},

// ==================== 电磁感应 · 统一 ====================
{
  id:"flux", title:"磁通变化 → 感应电动势 ε=nΔΦ/Δt", layer:"induction", coverage:"ok",
  oneLine:"穿过回路的磁通量一旦变化,就产生感应电动势(法拉第电磁感应定律)。",
  body:`
    <h4>法拉第电磁感应定律</h4>
    <p>$$\\varepsilon = n\\dfrac{\\Delta\\Phi}{\\Delta t}$$</p>
    <p>感应电动势正比于<b>磁通量的变化率</b>(n 为匝数)。注意是"变化率",不是磁通本身——<b>Φ 不变则不生电</b>。</p>
    <h4>磁通变化的三种途径</h4>
    <ul>
      <li>B 变(变化的磁场);</li>
      <li>S 变(回路面积改变);</li>
      <li>B 与 S 夹角变(线圈转动,发电机原理)。</li>
    </ul>
    <h4>动生电动势</h4>
    <p>导体棒切割磁感线:$$\\varepsilon = BLv$$(B、L、v 三者两两垂直时)。它本质是导体内自由电荷受<b>洛伦兹力</b>驱动——把磁场和电场又连了起来。</p>
  `,
  edges:[ {to:"mag-B",type:"来自ΔΦ"}, {to:"lenz",type:"定方向"}, {to:"lorentz",type:"本质"}, {to:"motional-emf",type:"含动生"}, {to:"em-unify",type:"统一"} ],
  sources:SRC,
},
{
  id:"motional-emf", title:"动生电动势 ε=BLv · 导轨模型", layer:"induction", coverage:"ok",
  oneLine:"导体棒切割磁感线产生 ε=BLv;它就是电动机里的『反电动势』,回路电流 I=(ε源−BLv)/R。发电与电动的枢纽。",
  body:`
    <h4>动生电动势</h4>
    <p>一段长 L 的导体棒,在磁场 B 中以速度 v 运动(B、L、v 两两垂直)切割磁感线,产生电动势:</p>
    <p>$$\\varepsilon = BLv$$</p>
    <p>方向用右手定则:伸开右手,磁感线穿过手心,拇指指棒的运动方向,四指即感应电流方向。</p>
    <h4>微观本质:仍然是洛伦兹力</h4>
    <p>棒一动,棒内的自由电荷就随棒有了速度 v,于是受<b>洛伦兹力</b> $qvB$ 沿棒方向被推,电荷在棒两端堆积、形成电势差——这就是电动势的来源。所以 $\\varepsilon=BLv$ 本质还是洛伦兹力,只不过这次它驱动电荷<b>沿棒</b>运动。</p>
    <h4>反电动势(电动机里)</h4>
    <p>当通电导线被安培力推着动起来后,它一边运动就一边产生 $BLv$。由楞次定律,这个电动势<b>总是反抗原来的电流</b>,所以叫<b>反电动势</b>,它会削弱回路的净电动势。</p>
    <h4>导轨模型:怎么算电流</h4>
    <p>导体棒 + 导轨 + 电源(电动势 $\\varepsilon_0$)+ 回路总电阻 R,闭合电路方程:</p>
    <p>$$\\varepsilon_0 - BLv = IR \\;\\Rightarrow\\; I = \\dfrac{\\varepsilon_0 - BLv}{R}$$</p>
    <ul>
      <li>启动瞬间 $v=0$:电流最大 $I_0=\\dfrac{\\varepsilon_0}{R}$;</li>
      <li>棒越动越快 → $BLv$ 越大 → I 越小 → 安培力 $F=BIL$ 越小;</li>
      <li>空载最终态:$BLv=\\varepsilon_0$,电流为 0,达到最大速度 $v_{\\max}=\\dfrac{\\varepsilon_0}{BL}$;</li>
      <li>带负载(摩擦/重物):稳态时安培力恰好平衡负载,电流停在对应值。</li>
    </ul>
    <h4>能量守恒</h4>
    <p>把电路方程两边乘 I:</p>
    <p>$$\\varepsilon_0 I = I^2 R + BLv\\cdot I$$</p>
    <p>三项分别是:<b>电源输出功率</b> = <b>电阻热耗</b> + <b>安培力机械功率</b>。其中 $BLv\\cdot I$(反电动势×电流)正是磁场"转手"成机械能的那部分——磁场只当中介,不出能量。</p>
    <blockquote>切割生电($\\varepsilon=BLv$,发电机)和 通电受力($F=BIL$,电动机)是同一根棒的两副面孔,靠能量守恒串在一起。导轨模型是上海卷电磁感应压轴题的核心载体,务必练熟。</blockquote>
  `,
  edges:[ {to:"flux",type:"属于"}, {to:"lorentz",type:"微观本质"}, {to:"ampere",type:"对偶(电动/发电)"}, {to:"lenz",type:"定方向"}, {to:"mag-B",type:"依赖B"} ],
  sources:SRC,
},
{
  id:"b-field-energy", title:"磁场能", layer:"induction", coverage:"partial",
  oneLine:"磁场本身储存能量:电感储能 ½LI²;密度 B²/(2μ₀)。存取靠电磁感应,磁力始终不做功。与电场能对称。",
  body:`
    <h4>电感储能</h4>
    <p>给电感线圈通电、建立起磁场,能量就以<b>磁场</b>的形式存了起来:</p>
    <p>$$W = \\dfrac{1}{2}LI^2$$</p>
    <p>断电时磁场消失,这份能量被放出来——<b>这就是拉断大电感电路会打火花的原因</b>(储存的磁能瞬间释放,产生很高的自感电动势)。</p>
    <h4>能量密度 <span style="color:#fbbf24">⭐拓展</span></h4>
    <p>能量弥散在有磁场的空间里,单位体积存:</p>
    <p>$$u = \\dfrac{B^2}{2\\mu_0}$$</p>
    <p>其中真空磁导率 $\\mu_0 = 4\\pi\\times10^{-7}\\ \\mathrm{T\\cdot m/A}$。B 越强,存的能量越密。</p>
    <h4>关键澄清:磁力不做功,磁场却能储能?</h4>
    <p>不矛盾。差别在于磁场<b>变不变</b>:</p>
    <ul>
      <li><b>稳恒磁场</b>(电动机、匀强场里的线圈):磁场不变 → 磁能不变 → 磁场只当"传送带",把电能转手成机械能,自己能量库没动。</li>
      <li><b>变化磁场</b>(电感通/断电、变压器):磁能真的在存取。</li>
    </ul>
    <p>而磁能的存取<b>不是靠磁力做功</b>(洛伦兹力永远不做功),而是靠<b>电磁感应</b>——变化磁场感应出的<b>电场</b>去对电荷做功、搬运能量。所以"磁力不做功"和"磁场能存取"始终自洽。</p>
    <blockquote>它和电场能 $\\tfrac12 CU^2$、$u=\\tfrac12\\varepsilon_0 E^2$ 完全对称——电感↔电容、B↔E。</blockquote>
  `,
  edges:[ {to:"mag-B",type:"储能于B"}, {to:"lorentz",type:"磁力不做功"}, {to:"flux",type:"靠感应存取"}, {to:"e-field-energy",type:"对称"}, {to:"em-unify",type:"传播"} ],
  sources:SRC,
},
{
  id:"lenz", title:"楞次定律 / 右手定则", layer:"induction", coverage:"ok",
  oneLine:"感应电流的方向总是『阻碍』引起它的磁通量变化;切割用右手定则。",
  body:`
    <h4>楞次定律(定方向)</h4>
    <p>感应电流的效果<b>总是反抗磁通量的变化</b>:磁通增加,感应电流的磁场就反向抵抗("增反");磁通减少,就同向补充("减同")。</p>
    <h4>右手定则(切割情形)</h4>
    <p>伸开右手,磁感线穿手心,拇指指导体运动方向,四指即感应电流方向。</p>
    <h4>能量视角</h4>
    <p>"阻碍"的本质是<b>能量守恒</b>:要维持磁通变化必须克服阻力做功,机械能因此转化为电能。反抗越强,产生的电能越多。</p>
    <p><span style="color:#fbbf24">⭐拓展</span>:自感、涡流都是楞次定律的延伸。</p>
  `,
  edges:[ {to:"flux",type:"定方向"}, {to:"em-unify",type:"统一"} ],
  sources:SRC,
},
{
  id:"em-unify", title:"电磁场 · 电磁波", layer:"induction", coverage:"partial",
  oneLine:"变化的磁生电、变化的电生磁——电与磁统一为电磁场,传播出去就是电磁波。",
  body:`
    <p>电磁感应告诉我们:<b>变化的磁场能产生电场</b>。麦克斯韦进一步提出对称的另一半:<b>变化的电场也能产生磁场</b>。</p>
    <ul>
      <li>于是电场和磁场不再是两样东西,而是同一个<b>电磁场</b>的两面;</li>
      <li>变化的电场与磁场相互激发、交替向外传播,就是<b>电磁波</b>(横波),真空中速度</li>
    </ul>
    <p>$$c = \\dfrac{1}{\\sqrt{\\varepsilon_0 \\mu_0}} \\approx 3\\times10^8\\ \\mathrm{m/s}$$</p>
    <p>式中真空磁导率 $\\mu_0 = 4\\pi\\times10^{-7}\\ \\mathrm{T\\cdot m/A}$,真空介电常数 $\\varepsilon_0 \\approx 8.85\\times10^{-12}\\ \\mathrm{C^2/(N\\cdot m^2)}$。</p>
    <blockquote>注意 c 的表达式里又出现了<b>真空介电常数 ε₀</b>(和库仑定律里的同一个)——这正是电、磁、光三者统一的标志。<span style="color:#fbbf24">⭐拓展</span></blockquote>
  `,
  edges:[ {to:"flux",type:"来自"}, {to:"lenz",type:"来自"}, {to:"coulomb",type:"共享ε₀"}, {to:"e-field-energy",type:"场能传播"}, {to:"b-field-energy",type:"场能传播"} ],
  sources:SRC,
},

];
