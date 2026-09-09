/** Art coordinates: normalized percentages of the EXACT image rectangle.
 * Image and transparent buttons share one intrinsic-aspect plane. Replacing art
 * requires updating dimensions and these boxes, not viewport-specific offsets.
 * No labels, dialogue bubbles, or furniture overlays are positioned on the art.
 */
export const scenes = {
  fees: {asset:'fees',width:1400,height:962,tone:'teal',alt:'两个完整的客服工位，许宁坐在左侧，赵航站在右侧；电脑、包裹、椅架和鞋子保持原图构图。',caption:'项目工位：先听清这笔新增费用的来由。',hotspots:[
    {role:'colleague',x:14,y:20,w:22,h:54},
    {role:'speaker',x:79,y:10,w:17,h:70},
  ]},
  conflict: {asset:'conflict',width:1600,height:1309,tone:'paper',alt:'完整的采购评审会议室，弧形会议桌旁有多位同事；右侧黄衣许宁与桌子上方的灰发周经理是本段发言者。',caption:'采购评审室：其他同事正在准备材料，对话从许宁开始。',hotspots:[
    {role:'applicant',x:66,y:49,w:12,h:13},
    {role:'manager',x:37,y:23,w:9,h:15},
  ]},
  gifts: {asset:'gifts',width:1100,height:1070,tone:'teal',alt:'许宁戴耳机坐在完整的白色电脑工位前，桌面放着两份礼品；椅轮、鞋子和桌腿均在画内。',caption:'员工工位：许宁通过耳机与陈卓通话，陈卓不在画面内。',hotspots:[
    {role:'applicant',x:45,y:30,w:23,h:50},
  ]},
};
