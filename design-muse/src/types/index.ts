export interface CreativeDesign {
  id: string;
  name: string;
  solution: string;
  industrialCMF: string;
  mainSellingPoint: string;
  secondarySellingPoint: string;
}

export interface DesignDescription {
  designId: string;
  designName: string;
  descriptions: string[];
}

export interface DesignSession {
  id: string;
  currentStep: number;
  productName: string;
  marketReport: string | null;
  userPersonas: Persona[] | null;
  selectedPersonas: string[];
  productAnalysis: string | null;
  buyingPoints: BuyingPoint[] | null;
  selectedPoints: string[];
  solutions: Solution[] | null;
  selectedSolutions: string[];
  designerStyle: DesignerStyle | null;
  creativeDesigns: CreativeDesign[] | null;
  selectedDesigns: string[];
  designDescriptions: DesignDescription[] | null;
}

export interface Persona {
  id: string;
  name: string;
  description: string;
  age: string;
  occupation: string;
  painPoints: string[];
  percentage?: string;
}

export interface BuyingPoint {
  id: string;
  point: string;
  priority: number;
  description: string;
  personaId: string;
}

export interface Solution {
  id: string;
  buyingPoint: string;
  solution: string;
  papers: Paper[];
}

export interface Paper {
  name: string;
  source: string;
  excerpt: string;
  url: string;
}

export interface DesignerStyle {
  id: string;
  name: string;
  works: string;
  philosophy: string;
  traits: string[];
}

export const DESIGNER_STYLES: DesignerStyle[] = [
  {
    id: 'loie',
    name: '雷蒙德·罗维',
    works: '可口可乐玻璃瓶、航空、船舶、火车外观设计',
    philosophy: '流线型、简洁，强调"最美的曲线是销售曲线"，用一两条关键主曲线勾出整体轮廓，用大面积干净色块形成清晰"轮廓识别"',
    traits: ['流线型', '简洁', '量产导向', '轮廓识别']
  },
  {
    id: 'rams',
    name: '迪特·拉姆斯',
    works: '博朗收音机、剃须刀、音响等家电产品',
    philosophy: '"少，却更好"，只保留必要功能，界面布局用网格、对齐、统一间距，极度克制，让产品"隐身"但异常顺手',
    traits: ['极简', '功能克制', '网格布局', '可读性']
  },
  {
    id: 'stark',
    name: '菲利普·斯塔克',
    works: '小米MIX手机、2024巴黎奥运会奖牌',
    philosophy: '先打破常规，从大胆概念出发，允许夸张比例和出其不意的材料拼接，让"鬼才想法"落地为可用的工业产品',
    traits: ['大胆创新', '概念驱动', '材料拼接', '结构合理']
  },
  {
    id: 'dyson',
    name: '詹姆斯·戴森',
    works: '无叶风扇、AirBlade干手器、吸尘器、吹风机',
    philosophy: '从技术问题出发，用工程视角定义空气流动等核心问题，外形包裹和强化气流路径，表面显露科技感和逻辑性',
    traits: ['技术驱动', '功能可见', '理工感', '精密']
  },
  {
    id: 'ive',
    name: '乔纳森·艾弗',
    works: 'iPhone系列、iPad等苹果设备',
    philosophy: '"为用户删掉思考"，把交互路径精简到最少，形体趋向规整几何，追求软硬件一体感，让产品像安静的"工具石"',
    traits: ['简洁', '规整几何', '软硬一体', '低干扰']
  },
  {
    id: 'yanagi',
    name: '柳宗理',
    works: '不锈钢餐具、锅具、椅子等日用器物',
    philosophy: '先用手"捏"形，从手势中自然长出曲线，追求"看起来普通，用起来惊艳"，通过边缘厚薄、弧度制造细腻体验',
    traits: ['手感', '曲线自然', '日式简约', '细腻']
  },
  {
    id: 'kurokawa',
    name: '黑川雅之',
    works: '建筑逻辑引入的工业产品，《日本八种审美意识》',
    philosophy: '从"存在感"入手，把产品视作小建筑，练习"微、合、气、空、密、素、假、破"八种意识，营造含蓄东方情绪',
    traits: ['建筑感', '东方美学', '存在感', '意境']
  },
  {
    id: 'naoto',
    name: '深泽直人',
    works: '±0品牌家电、为苹果/爱普生设计的产品',
    philosophy: '先观察用户"无意识动作"，把行为转译成最少的几何元素，避免锐角和复杂装饰，让产品"像空气一样融入生活"',
    traits: ['无意识设计', '安静', '融入环境', '极简几何']
  }
];
