import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// 大连地区宠物门店数据
const storesData = [
  { name: '宠印春天', address: '山东路商城7号3-101', district: '甘井子区', latitude: 38.980326, longitude: 121.586298 },
  { name: 'WarmPet沃派宠物(龙湖·星海彼岸店)', address: '龙湖星海彼岸七贤路39-1号', district: '甘井子区', latitude: 38.862486, longitude: 121.538074 },
  { name: '有它·宠物生活馆(钻石湾和信园北区店)', address: '甘井子街道钻石湾和信园13-2号', district: '甘井子区', latitude: 38.959026, longitude: 121.618846 },
  { name: '毛球宠物店', address: '辽宁省大连市甘井子区凌水街道高新园区新新园小区30号楼', district: '甘井子区', latitude: 38.895216, longitude: 121.536968 },
  { name: '关于它的店宠物店(山东路店)', address: '山东路268号楼2-1-1(圣梦美容院隔壁)', district: '甘井子区', latitude: 38.99105, longitude: 121.590241 },
  { name: '布兜宠物(伟业西街店)', address: '泡崖街道伟业西街13号(泡崖市场北行200米)', district: '甘井子区', latitude: 38.981859, longitude: 121.560732 },
  { name: '宠光年宠物(壹品漫谷C区店)', address: '高新园区屹馨街90-2号', district: '甘井子区', latitude: 38.887582, longitude: 121.509537 },
  { name: '笑笑宠物店(宏乐街3号)', address: '宏乐街3号6号', district: '甘井子区', latitude: 38.98356, longitude: 121.566395 },
  { name: '余生宠物生活馆(万科西山天街店)', address: '红旗西路302-2号', district: '甘井子区', latitude: 38.946326, longitude: 121.493673 },
  { name: '大萌宠物', address: '辛寨子辛府园16号楼1-1-1号', district: '甘井子区', latitude: 38.968113, longitude: 121.518398 },
  { name: '宠语宠物店', address: '促进路172号', district: '甘井子区', latitude: 38.955094, longitude: 121.584494 },
  { name: '旺鑫宠物诊所(千山心城店)', address: '千山路千山心城', district: '甘井子区', latitude: 38.983937, longitude: 121.579875 },
  { name: '5号宠物', address: '六平路4号（华南安盛，华东路，天河路，山东路）', district: '甘井子区', latitude: 38.990982, longitude: 121.596055 },
  { name: '一只桃花宠物店', address: '招商海德B区奥岭北园27-8号', district: '甘井子区', latitude: 39.033543, longitude: 121.580409 },
  { name: '麦乐斯宠物(大连店)', address: '松江路清和园', district: '甘井子区', latitude: 38.976635, longitude: 121.560515 },
  { name: '夏天宠物', address: '玉境路32号', district: '甘井子区', latitude: 38.976773, longitude: 121.553495 },
  { name: '爱它它宠物(机场店)', address: '贤林园50-1号', district: '甘井子区', latitude: 38.958468, longitude: 121.552098 },
  { name: '木木宠物生活会馆', address: '辽宁省大连市甘井子区椒金山街道万科金地和风明月3期和裕园1-9号', district: '甘井子区', latitude: 38.966664, longitude: 121.610995 },
  { name: '泡泡宠物会馆', address: '红旗东路13-1号', district: '甘井子区', latitude: 38.928276, longitude: 121.559657 },
  { name: '爱堡宠物', address: '玉浓街38号9号公建', district: '甘井子区', latitude: 38.985987, longitude: 121.550804 },
  { name: '大连市益康宠物医院(二部)', address: '周水子街道芳林街49号', district: '甘井子区', latitude: 38.960646, longitude: 121.59078 },
  { name: '仁合宠物医院(华录总院)', address: '黄浦路664号一层6号公建', district: '甘井子区', latitude: 38.858742, longitude: 121.529543 },
  { name: '蜗牛宠物用品店', address: '龙畔金泉H2区33号楼一单元一楼二', district: '甘井子区', latitude: 39.002652, longitude: 121.631299 },
  { name: '奕赢宠物用品商行', address: '大连市甘井子区渤海路中国石油加油站东北侧约100米', district: '甘井子区', latitude: 39.017452, longitude: 121.539194 },
  { name: '瑞达动物医院', address: '中华路街道七迎路51号楼1-1-3号', district: '甘井子区', latitude: 38.991569, longitude: 121.584107 },
  { name: '巴黎宠物医院(泉水店)', address: '泉水金地檀溪R1区27-2檀公馆', district: '甘井子区', latitude: 39.009942, longitude: 121.633917 },
  { name: '有家宠物用品仓买店', address: '辽宁省大连市甘井子区霞岭园31-10号', district: '甘井子区', latitude: 39.0345, longitude: 121.583264 },
  { name: '兴旺宠物医院(姚家店)', address: '姚家路与姚西街交叉口东北60米', district: '甘井子区', latitude: 39.028346, longitude: 121.615422 },
  { name: '狼道宠物诊所', address: '大连市甘井子区博艺街金地·艺境-一期', district: '甘井子区', latitude: 39.043952, longitude: 121.666678 },
  { name: '咪汪时光宠物生活馆(屹馨百合社区店)', address: '辽宁省大连市甘井子区屹馨南街146-26号屹馨百合社区', district: '甘井子区', latitude: 38.885011, longitude: 121.507741 },
  { name: '汪汪宠物生活馆(玉意街店)', address: '玉意街7号', district: '甘井子区', latitude: 38.987563, longitude: 121.553625 },
  { name: '楠得一家宠物生活馆', address: '迎客路19号1单元101室', district: '甘井子区', latitude: 38.964706, longitude: 121.558167 },
  { name: '萌宠友家宠物生活馆(美域盛景店)', address: '美域盛景西1门旁', district: '甘井子区', latitude: 39.006479, longitude: 121.608465 },
  { name: '迷糊宠物生活馆', address: '辽宁省大连市甘井子区玉境路35号', district: '甘井子区', latitude: 38.975681, longitude: 121.55457 },
  { name: '乐享宠物生活馆(泉水B5区店)', address: '辽宁省大连市甘井子区泉水B5区16-7号', district: '甘井子区', latitude: 39.013407, longitude: 121.608715 },
  { name: '你和它宠物生活馆(万科·新都会店)', address: '云岭街万科新都会1层31-24室', district: '甘井子区', latitude: 39.033726, longitude: 121.583341 },
  { name: '宠多多宠物生活馆(岚岭路店)', address: '辽宁省大连市甘井子区南关岭街道玉岭南园19号、31号', district: '甘井子区', latitude: 39.025064, longitude: 121.591235 },
  { name: '憨宝阁宠物生活馆(金地艺境一期店)', address: '鹤大线博艺南园26-5号', district: '甘井子区', latitude: 39.044133, longitude: 121.66891 },
  { name: '糖白萌宠宠物生活馆', address: '屹馨街9号楼12号公建', district: '甘井子区', latitude: 38.885261, longitude: 121.512326 },
  { name: '艾琳宠物生活馆(新昌小区店)', address: '辽宁省大连市甘井子区新昌小区25号楼', district: '甘井子区', latitude: 38.960047, longitude: 121.53574 },
  { name: '翠宝宠物生活馆', address: '大连市甘井子区辛寨子辛府园12-10号', district: '甘井子区', latitude: 38.968191, longitude: 121.519839 },
  { name: '宠遇联萌宠物生活馆', address: '秀岭街1-9号公建', district: '甘井子区', latitude: 39.0243, longitude: 121.597207 },
  { name: '萌萌之家宠物生活馆', address: '虹韵路168号', district: '甘井子区', latitude: 38.956571, longitude: 121.531504 },
  { name: '哈特宠物生活馆', address: '科业街31-1', district: '甘井子区', latitude: 38.990443, longitude: 121.46631 },
  { name: '骨头部落宠物生活馆(泡崖新村店)', address: '玉胜路6号1层', district: '甘井子区', latitude: 38.976577, longitude: 121.559249 },
  { name: '晴天宠物生活馆', address: '汇德街142-15号', district: '甘井子区', latitude: 39.008592, longitude: 121.598089 },
  { name: '宠汇·精致宠物生活馆', address: '山东路206-1-1-2', district: '甘井子区', latitude: 38.987186, longitude: 121.588586 },
  { name: '骨头部落宠物生活馆(泉水龙畔店)', address: '泉水街道水泉街泉水H3区12号楼1楼12-18号', district: '甘井子区', latitude: 39.004022, longitude: 121.628219 },
  { name: '克来思佳宠物生活馆', address: '融泉路泉水便民市场31号', district: '甘井子区', latitude: 39.018871, longitude: 121.63907 },
  { name: '喵了个汪(宏都熙景店)', address: '汇畅街69-2', district: '甘井子区', latitude: 39.006187, longitude: 121.600067 },
  { name: '禧·它宠物生活馆', address: '泡崖八区玉丽街13号', district: '甘井子区', latitude: 38.987075, longitude: 121.556371 },
  { name: '家贝宠爱生活馆(泉水店)', address: '椒北路泉水e3区57-2号', district: '甘井子区', latitude: 39.004818, longitude: 121.616849 },
  { name: 'PUPU-SHEEP噗噗羊宠物沙龙', address: '悦岭西街绿城诚园二期78-4号', district: '甘井子区', latitude: 39.016599, longitude: 121.581147 },
  { name: '小时宠物会馆(哈佛映像店)', address: '凌水路高新技术产业园清馨东园7-4', district: '甘井子区', latitude: 38.882412, longitude: 121.513036 },
  { name: 'Petmagic宠魔法宠物美容(高新店)', address: '高新园区凌水路193-6号', district: '甘井子区', latitude: 38.882381, longitude: 121.525575 },
  { name: '宠物美容', address: '大连市甘井子区营城东路驿城新居东南侧约40米', district: '甘井子区', latitude: 39.001928, longitude: 121.438778 },
  { name: '时代宠艺宠物用品超市', address: '汇善南园13-8号', district: '甘井子区', latitude: 38.999182, longitude: 121.5885 },
  { name: '圣宠大地宠物造型工作室', address: '辽宁省大连市甘井子区机场街道南华街15号3单元1层', district: '甘井子区', latitude: 38.957009, longitude: 121.544467 },
  { name: '0411宠物会馆', address: '千山路8号0411号', district: '甘井子区', latitude: 38.983796, longitude: 121.593745 },
  { name: '派特盟宠物服务中心', address: '辽宁省大连市甘井子区玉浓西街4-6号', district: '甘井子区', latitude: 38.983227, longitude: 121.551302 },
  { name: 'Tony宠屋', address: '大连市甘井子区张前路中国石油加油站西南侧约130米', district: '甘井子区', latitude: 39.016227, longitude: 121.5367 },
  { name: '宠物洗澡堂', address: '大连市甘井子区天河路大连华南中学西南侧约210米', district: '甘井子区', latitude: 38.99005, longitude: 121.592926 },
  { name: '芒果的宠物(美林园店)', address: '榆水街5号3单元1层3号', district: '甘井子区', latitude: 38.97857, longitude: 121.523413 },
  { name: '萌芽爱宠生活馆', address: '辽宁省大连市甘井子区柳树南街柳韵园37号', district: '甘井子区', latitude: 38.919469, longitude: 121.482095 },
  { name: '宠之匠宠物店', address: '北洋小区-1号楼-3单元永利巷1-3号', district: '沙河口区', latitude: 38.921693, longitude: 121.598456 },
  { name: '宠乐窝宠物店', address: '春柳街52号', district: '沙河口区', latitude: 38.9449, longitude: 121.580054 },
  { name: '闪电猫宠物生活馆(和舍艺术工厂店)', address: '新生路刘家桥295号和舍艺术园区1号楼', district: '沙河口区', latitude: 38.951504, longitude: 121.578735 },
  { name: '宠屿宠物店', address: '高新园区五一路231B-3', district: '沙河口区', latitude: 38.900559, longitude: 121.563398 },
  { name: '宠缘宠物(中长东五街店)', address: '中长东五街与鞍山路交叉口北40米', district: '沙河口区', latitude: 38.928112, longitude: 121.595934 },
  { name: '达达宠物馆(新型新有小区店)', address: '敦煌南街106号楼1层3号', district: '沙河口区', latitude: 38.937345, longitude: 121.587817 },
  { name: '维尼宠物生活会馆(西林街店)', address: '辽宁省大连市沙河口区西林街2号', district: '沙河口区', latitude: 38.924858, longitude: 121.579785 },
  { name: '佳家宠物会所', address: '红凌路12号', district: '沙河口区', latitude: 38.924976, longitude: 121.552348 },
  { name: '初心宠物(辽师店二部)', address: '兰秀小区14-4号', district: '沙河口区', latitude: 38.923749, longitude: 121.571407 },
  { name: '徐先生的宠物店', address: '绿波路绿波帝欧花园B7-5号', district: '沙河口区', latitude: 38.942461, longitude: 121.571192 },
  { name: 'T9美宠', address: '学工街2号1层6号', district: '沙河口区', latitude: 38.94273, longitude: 121.587022 },
  { name: '萌宠来了宠物店', address: '大连市沙河口区北甸街幸福小区北侧约150米', district: '沙河口区', latitude: 38.924552, longitude: 121.574206 },
  { name: '鑫达宠物用品', address: '香西路137号', district: '沙河口区', latitude: 38.933957, longitude: 121.587179 },
  { name: '熊多多宠物', address: '连山街1号楼1层1号商铺', district: '沙河口区', latitude: 38.897342, longitude: 121.569686 },
  { name: '家有萌宠(中央大道旅游文化购物中心店)', address: '辽宁省大连市沙河口区西安路107号中央大道旅游文化购物中心B1', district: '沙河口区', latitude: 38.921647, longitude: 121.592073 },
  { name: '大连红星宠物用品(中央大道旅游文化购物中心店)', address: '中央大道摩尼宝萌宠公园', district: '沙河口区', latitude: 38.92195, longitude: 121.590105 },
  { name: '珍爱宠物诊所(苏州小区北区店)', address: '苏州街41号1层1号，2号', district: '沙河口区', latitude: 38.890891, longitude: 121.56563 },
  { name: '美联众合动物医院(黄河路瑞美分院)', address: '辽宁省大连市沙河口区黄河路520号中山公园南门斜对面', district: '沙河口区', latitude: 38.916942, longitude: 121.606141 },
  { name: '兴裕轩乐宠(中央大道旅游文化购物中心店)', address: '西安路107号大连中央大道吾悦广场B1层', district: '沙河口区', latitude: 38.921566, longitude: 121.592 },
  { name: '阿米奇宠物生活馆', address: '辽宁省大连市沙河口区中山公园华宫内', district: '沙河口区', latitude: 38.917925, longitude: 121.608394 },
  { name: '宠物宝宝生活会馆(数码店)', address: '知心街80号（数码广场）', district: '沙河口区', latitude: 38.891178, longitude: 121.554827 },
  { name: '爱宠岛宠物生活馆', address: '凌山三街春柳街道办事处旁', district: '沙河口区', latitude: 38.944884, longitude: 121.579909 },
  { name: '萌翻天宠物生活馆', address: '辽宁省大连市沙河口区水源巷4号', district: '沙河口区', latitude: 38.917717, longitude: 121.585031 },
  { name: '羽宠物生活馆(沙河口店)', address: '万泰花园2期', district: '沙河口区', latitude: 38.914704, longitude: 121.603133 },
  { name: '偏宠你宠物生活馆', address: '恒大帝景A2区锦石园21-3', district: '沙河口区', latitude: 38.950771, longitude: 121.558275 },
  { name: '7宠馆·宠物生活(新希望花园店)', address: '星海湾新希望花园高尔基路405号', district: '沙河口区', latitude: 38.903142, longitude: 121.597628 },
  { name: '汪来喵往宠物生活馆', address: '锦霞北园49号8单元1层4号', district: '沙河口区', latitude: 38.952078, longitude: 121.553847 },
  { name: 'coffee宠物生活馆', address: '大连市沙河口区北甸街大连第四十九中学北侧约140米', district: '沙河口区', latitude: 38.924206, longitude: 121.574817 },
  { name: '满点宠物(伊珊娜软水洗护店)', address: '五一路100-13号', district: '沙河口区', latitude: 38.908882, longitude: 121.584758 },
  { name: '峰哥优宠(中央大道旅游文化购物中心店)', address: '辽宁省大连市沙河口区西安路107号中央大道旅游文化购物中心B1', district: '沙河口区', latitude: 38.921571, longitude: 121.592001 },
  { name: '萌尚宠物(交大店)', address: '辽宁省大连市沙河口区兴工街道西林街32号101', district: '沙河口区', latitude: 38.92354, longitude: 121.579369 },
  { name: '非常爱宠', address: '辽宁省大连市沙河口区黑石礁街道杨树南街7-5', district: '沙河口区', latitude: 38.884464, longitude: 121.549123 },
  { name: '萌宠生活馆', address: '辽宁省大连市沙河口区鞍山路65-6号', district: '沙河口区', latitude: 38.946021, longitude: 121.560072 },
  { name: '毛孩宠物店', address: '学府南街高安里38栋1楼5号', district: '金州区', latitude: 39.074815, longitude: 121.828126 },
  { name: '金宝宝宠物', address: '辽宁省大连市金州区黄海西四路86号', district: '金州区', latitude: 39.059273, longitude: 121.804891 },
  { name: '爱尚萌宠物', address: '和平路84号1单元1层店铺', district: '金州区', latitude: 39.111906, longitude: 121.71499 },
  { name: '星恋萌宠(丰本金河人家店)', address: '石河丰本2号楼', district: '金州区', latitude: 39.35074, longitude: 121.862457 },
  { name: 'D&C宠堡(亿锋广场店)', address: '亿锋广场三期赤峰街50-1号', district: '金州区', latitude: 39.052682, longitude: 121.757687 },
  { name: '吾家有宠(旭辉江山樾店)', address: '玄德路84-7号1层', district: '金州区', latitude: 39.077873, longitude: 121.929882 },
  { name: '卖萌(万达广场店)', address: '辽河西路117号万达广场大连开发区店F1层', district: '金州区', latitude: 39.065499, longitude: 121.789223 },
  { name: '亲亲宠物店(西河商城店)', address: '辽宁省大连市金州区北山路650-58号', district: '金州区', latitude: 39.109373, longitude: 121.71752 },
  { name: '拍拍宠物(华润·海中国3期店)', address: '辽宁省大连市金州区华润海中国三期4号', district: '金州区', latitude: 39.041595, longitude: 121.762267 },
  { name: '恩宠宠物诊所', address: '辽宁省大连市金州区同济路胜利西小区44号', district: '金州区', latitude: 39.105906, longitude: 121.716966 },
  { name: '小柏宠物用品(和平小区店)', address: '光明街道和平路228号2单元2层1号楼下底仓', district: '金州区', latitude: 39.111443, longitude: 121.720448 },
  { name: '原姐宠物会所(八一花园店)', address: '辽宁省大连市金州区东升街26号1单元', district: '金州区', latitude: 39.112669, longitude: 121.728235 },
  { name: '康旺宠物诊所(古城丁区店)', address: '古城丁区53号楼公建康旺宠物诊所', district: '金州区', latitude: 39.12069, longitude: 121.71841 },
  { name: '宠光年宠物(开发区店)', address: '辽宁省大连市金州区盘锦路金棕榈5栋4号', district: '金州区', latitude: 39.053584, longitude: 121.767263 },
  { name: '贝萌萌小意私宠馆(亿锋广场店)', address: '兴城路37-9号亿锋广场一期1层', district: '金州区', latitude: 39.050264, longitude: 121.759108 },
  { name: '奇林爱宠(乾豪·格林小镇店)', address: '开发区格林小镇53号楼南5共建', district: '金州区', latitude: 39.050557, longitude: 121.82301 },
  { name: '关爱宠物医院(大连金州区)', address: '金马路450号', district: '金州区', latitude: 39.048338, longitude: 121.803688 },
  { name: '圣越犬舍', address: '石北线与滨海公路交叉口东南500米', district: '金州区', latitude: 39.31858, longitude: 121.78576 },
  { name: '七月萌宠', address: '经济技术开发区湾里南18-14号', district: '金州区', latitude: 39.070797, longitude: 121.858887 },
  { name: '玖月名猫馆', address: '站前街道生辉第一城共建12-1号1层', district: '金州区', latitude: 39.058995, longitude: 121.749382 },
  { name: '宝贝宠物医院(金华店)', address: '和平路8-4号(金华酒店西走200米信号灯左侧)', district: '金州区', latitude: 39.111843, longitude: 121.71405 },
  { name: '小咖宠物(乾豪东城天下店)', address: '东城北路乾豪东城天下76-5', district: '金州区', latitude: 39.074083, longitude: 121.84731 },
  { name: '旺迪宠物医院', address: '经济技术开发区金马路169-6-9号', district: '金州区', latitude: 39.057807, longitude: 121.783341 },
  { name: '兴旺宠物医院(黄海西路店)', address: '开发区黄海西路155-2号', district: '金州区', latitude: 39.048529, longitude: 121.776888 },
  { name: '金爽宠物诊所', address: '湾里中路湾里南7栋18号公建', district: '金州区', latitude: 39.072254, longitude: 121.856984 },
  { name: '云宠吖宠物', address: '辽宁省大连市金州区黄海西路新辰里3号楼4单元1~2号', district: '金州区', latitude: 39.050349, longitude: 121.796932 },
  { name: '叮当宠物诊所(东城街店)', address: '东城园41-5号', district: '金州区', latitude: 39.0716, longitude: 121.848722 },
  { name: '哈哈宠物(东北四街店)', address: '东北四街62号', district: '金州区', latitude: 39.059052, longitude: 121.805296 },
  { name: '小胃一家宠物生活馆', address: '润海园东区25-2号1层', district: '金州区', latitude: 39.03948, longitude: 121.775753 },
  { name: '优加宠物门诊', address: '开发区赤峰街17-3号', district: '金州区', latitude: 39.052305, longitude: 121.761109 },
  { name: '妮妮宠物之家(大连金州体育场店)', address: '金州体育场3号门东北50米', district: '金州区', latitude: 39.103186, longitude: 121.730867 },
  { name: '家有萌宠用品屋', address: '辽宁省大连市金州区湾里街道经济技术开发区东城园8栋-4号', district: '金州区', latitude: 39.069486, longitude: 121.848521 },
  { name: '毛毛宠宠物店', address: '辽宁省大连市金州区湾里街道东城园55栋6号', district: '金州区', latitude: 39.072243, longitude: 121.847491 },
  { name: '乔巴宠物', address: '辽宁省大连市金州区北山路宏意小区20号楼4号', district: '金州区', latitude: 39.124975, longitude: 121.714665 },
  { name: '大喜的宠物生活馆(生辉第一城店)', address: '辽宁省大连市金州区金泉路生辉第一城12-4号1层', district: '金州区', latitude: 39.058829, longitude: 121.749482 },
  { name: '优宠一族(华润·海中国恋海园店)', address: '辽宁省大连市金州区经济技术开发区润海园东区21-2号1层', district: '金州区', latitude: 39.040312, longitude: 121.768232 },
  { name: '俊杰宠物会所', address: '大连市金州区北山路兴民宏意小区南侧约30米', district: '金州区', latitude: 39.123946, longitude: 121.716747 },
  { name: '爱宠吧宠物生活馆', address: '辽宁省大连市金州区渤海街217号楼4单元', district: '金州区', latitude: 39.091494, longitude: 121.746575 },
  { name: '百岁宠物生活馆(红梅翠竹店)', address: '大连市兴城路88号', district: '金州区', latitude: 39.049964, longitude: 121.769096 },
  { name: '清欢萌宠宠物生活馆(岗松里店)', address: '大连市金州区开发区岗松里9号楼1-1-4号', district: '金州区', latitude: 39.047255, longitude: 121.8035 },
  { name: '宠派宠物生活馆', address: '金石滩大连经济技术开发区之江路55-7号1层', district: '金州区', latitude: 39.102116, longitude: 122.033773 },
  { name: '喜乐宠宠物生活馆', address: '中长街道胜利路味食小区503号一单元', district: '金州区', latitude: 39.107463, longitude: 121.717888 },
  { name: '佩塔之家宠物生活馆', address: '迎湖街2号', district: '金州区', latitude: 39.105698, longitude: 121.724116 },
  { name: '艾塔宠物生活馆', address: '辽宁省大连市金州区卧龙园小区10号楼', district: '金州区', latitude: 39.101528, longitude: 121.914339 },
  { name: '金宠儿宠物美容(红星海店)', address: '红星海商业街159-5号红星海商业街a区1号楼159-10号', district: '金州区', latitude: 39.031278, longitude: 121.804453 },
  { name: '佳悦动物医院', address: '金石路御景园6栋—1单元', district: '金州区', latitude: 39.100445, longitude: 122.032326 },
  { name: '爱尚宠宠物(金湾新城店)', address: '辽宁省大连市金州区湾里东96-1号96号楼', district: '金州区', latitude: 39.076397, longitude: 121.862676 },
  { name: '爱尚宠儿宠物美容工作室(小孤山西里店)', address: '经济技术开发区小孤山西里27栋-5号', district: '金州区', latitude: 39.027874, longitude: 121.810008 },
  { name: '予枫宠物(佳兆业壹号店)', address: '中港北路(佳兆业壹号)45-6号', district: '金州区', latitude: 39.047794, longitude: 121.842668 },
  { name: '板栗宠物美容工作室', address: '辽河西路万达新域813室', district: '金州区', latitude: 39.0677, longitude: 121.792047 },
  { name: '小蓄宠物诊所', address: '辽宁省大连市金州区凤翔路37号', district: '金州区', latitude: 39.086732, longitude: 121.763061 },
  { name: '宠它美容生活馆(高民里店)', address: '辽宁省大连市金州区高志街高民里31号楼', district: '金州区', latitude: 39.06937, longitude: 121.831972 },
  { name: '明星犬舍', address: '辽宁省大连市庄河市黄海大街一段28号', district: '庄河市', latitude: 39.705782, longitude: 122.989421 },
  { name: '趣宠宠物', address: '大连市庄河市延安路金鹏家园', district: '庄河市', latitude: 39.696471, longitude: 122.984229 },
  { name: '王宇鸟舍', address: '大连市庄河市温州街庄河市实验小学西侧约110米', district: '庄河市', latitude: 39.706537, longitude: 122.986554 },
  { name: '徐伟宠物美容洗澡', address: '辽宁省大连市庄河市昌盛街二段32号', district: '庄河市', latitude: 39.697362, longitude: 122.978714 },
  { name: '可爱小动物', address: '大连市庄河市太平岭满族乡石太线台湾风情天一庄园旅游区', district: '庄河市', latitude: 39.862361, longitude: 122.96101 },
  { name: '汪汪队长宠物生活会馆(长胜花园店)', address: '大连市庄河市花园口经济区长胜花园3-23-3号', district: '庄河市', latitude: 39.563979, longitude: 122.644056 },
  { name: '宠满希旺宠物生活馆(文汇路店)', address: '郁香园餐厅', district: '庄河市', latitude: 39.700629, longitude: 122.974905 },
  { name: '灵宠宠物生活馆', address: '昌盛街道英伦河山三期西门1360号', district: '庄河市', latitude: 39.66021, longitude: 122.98479 },
  { name: '八福宠物店', address: '工五街一号楼（香炉礁社区卫生院东二十米）', district: '西岗区', latitude: 38.936538, longitude: 121.60317 },
  { name: '小坏蛋宠物馆(石葵路店)', address: '石葵路18号楼1-1室', district: '西岗区', latitude: 38.901864, longitude: 121.632593 },
  { name: '乔乔的宠物店', address: '鞍山路27-3号', district: '西岗区', latitude: 38.927484, longitude: 121.61888 },
  { name: '这里有家宠物店(拥警街店)', address: '白云街道拥政北街14号(铁路中学对面)', district: '西岗区', latitude: 38.910487, longitude: 121.609975 },
  { name: '咕得宠物美容店', address: '绕山路73号', district: '西岗区', latitude: 38.901516, longitude: 121.611666 },
  { name: '东东宠物店(香炉礁家具市场店)', address: '辽宁省大连市西岗区北岗街香炉礁家具市场', district: '西岗区', latitude: 38.929798, longitude: 121.611295 },
  { name: '毛球宠物生活馆', address: '八一路(盘山街4号)猫屿咖啡店', district: '西岗区', latitude: 38.892419, longitude: 121.655101 },
  { name: '丰源宠物(香炉礁家具市场店)', address: '东北路18号香炉礁家具市场宠物区14号', district: '西岗区', latitude: 38.929451, longitude: 121.61174 },
  { name: '卖萌宠物用品(香炉礁家具市场店)', address: '大连市西岗区北岗街香炉礁家具市场', district: '西岗区', latitude: 38.929441, longitude: 121.611478 },
  { name: '旺晟宠物用品', address: '大连市西岗区北岗街香炉礁家具市场', district: '西岗区', latitude: 38.929665, longitude: 121.611567 },
  { name: '掌萌人宠物生活馆', address: '辽宁省大连市西岗区香炉礁街道香一街36号101号', district: '西岗区', latitude: 38.93376, longitude: 121.601539 },
  { name: '太仔宠物', address: '长江路612号', district: '西岗区', latitude: 38.92457, longitude: 121.620614 },
  { name: 'Bo Pet私宠会所', address: '北京街22-5号北京公园1区西门旁', district: '西岗区', latitude: 38.926275, longitude: 121.61894 },
  { name: '宠Ta(香炉礁家具市场店)', address: '北岗街香炉礁家具市场', district: '西岗区', latitude: 38.929474, longitude: 121.611085 },
  { name: '若然小屋', address: '功勋街一号楼5单元103', district: '西岗区', latitude: 38.937522, longitude: 121.643509 },
  { name: 'HANA宠物生活馆', address: '辽宁省大连市西岗区沈阳路43号', district: '西岗区', latitude: 38.922562, longitude: 121.617104 },
  { name: '布鲁宠物生活馆', address: '茂田巷27号', district: '西岗区', latitude: 38.913479, longitude: 121.62838 },
  { name: '壹猫壹狗宠物生活馆(红馆小区店)', address: '北海街12号', district: '西岗区', latitude: 38.937637, longitude: 121.642444 },
  { name: '小伙伴宠物生活馆(香炉礁家具市场店)', address: '辽宁省大连市西岗区东北路18号香炉礁家具市场33号', district: '西岗区', latitude: 38.929682, longitude: 121.611449 },
  { name: '钢蹦儿宠物生活馆', address: '辽宁省大连市西岗区新康巷48号西岗区香炉礁家具市场', district: '西岗区', latitude: 38.929653, longitude: 121.611879 },
  { name: '名苑宠物美容馆', address: '北岗街香炉礁家具市场37号', district: '西岗区', latitude: 38.929651, longitude: 121.611666 },
  { name: '宠乐宠物(新春街店)', address: '辽宁省大连市西岗区新春街38号1层', district: '西岗区', latitude: 38.920865, longitude: 121.618056 },
  { name: '天喜宠物吧', address: '三元街20号', district: '西岗区', latitude: 38.915889, longitude: 121.631913 },
  { name: '玲玲宠物沙龙二部(北京公园1区店)', address: '鞍山路24-6', district: '西岗区', latitude: 38.927067, longitude: 121.620104 },
  { name: '洺犬工作室', address: '大连市西岗区北岗街香炉礁家具市场', district: '西岗区', latitude: 38.929393, longitude: 121.611119 },
  { name: '海美宠物', address: '解放路岭前街35号(桃源地铁站D口步行340米)', district: '中山区', latitude: 38.896499, longitude: 121.656961 },
  { name: '老陈宠物用品平价超市', address: '长江路141号', district: '中山区', latitude: 38.930745, longitude: 121.644464 },
  { name: '爱派特动物医院·全科诊疗中心', address: '武汉街70号（大通证券、住房公积金对面）', district: '中山区', latitude: 38.921901, longitude: 121.646638 },
  { name: '中宝连锁兴旺宠物医院', address: '鲁迅路121号', district: '中山区', latitude: 38.926016, longitude: 121.670378 },
  { name: '宠物巷宠物生活馆', address: '武昌街404号', district: '中山区', latitude: 38.914558, longitude: 121.654373 },
  { name: '宠爱宠物生活馆(春德街店)', address: '春德街96号1-2层2号公建', district: '中山区', latitude: 38.923545, longitude: 121.676506 },
  { name: '小哼宠物生活馆', address: '怡和街山屏社区北侧约130米', district: '中山区', latitude: 38.910109, longitude: 121.68419 },
  { name: '兜宠宠物生活馆', address: '大连市中南路怡和街19号楼1单元101', district: '中山区', latitude: 38.91133, longitude: 121.68379 },
  { name: '欢宠宠物生活馆', address: '独立街12号', district: '中山区', latitude: 38.921976, longitude: 121.64999 },
  { name: '毛宠天下宠物生活馆', address: '辽宁省大连市中山区民运巷31号1~3毛', district: '中山区', latitude: 38.905725, longitude: 121.649179 },
  { name: '汪星缘萌宠之家(虎滩路店)', address: '虎滩路虎滩新区156一1号', district: '中山区', latitude: 38.889309, longitude: 121.692837 },
  { name: '添宝宠物', address: '华乐街105号', district: '中山区', latitude: 38.921289, longitude: 121.687967 },
  { name: '狼道糖宝宠物美容(启新山水店)', address: '启新街62号', district: '旅顺口区', latitude: 38.830263, longitude: 121.288718 },
  { name: '良鑫萌宠(艺苑小区店)', address: '艺苑路243号', district: '旅顺口区', latitude: 38.859001, longitude: 121.252956 },
  { name: '拍子训犬俱乐部', address: '辽宁省大连市旅顺口区花都街', district: '旅顺口区', latitude: 38.94486, longitude: 121.333384 },
  { name: '巷子猫宠物生活馆', address: '九三路92-3号', district: '旅顺口区', latitude: 38.817082, longitude: 121.269692 },
  { name: '好旺宠物用品店', address: '辽宁省大连市旅顺口区横山街临建22号', district: '旅顺口区', latitude: 38.81246, longitude: 121.279712 },
  { name: '大大的好宠物生活馆(中融钰府店)', address: '玉玺路104-7号1-2层', district: '旅顺口区', latitude: 38.858417, longitude: 121.278945 },
  { name: '宠物美容洗澡', address: '大连市旅顺口区柏杨路铁山中心小学东侧约150米', district: '旅顺口区', latitude: 38.799923, longitude: 121.196122 },
  { name: '百宠汇宠物美容', address: '大连市旅顺口区长兴街三巷长兴小区西南侧', district: '旅顺口区', latitude: 38.82185, longitude: 121.282195 },
  { name: '宠物大咖', address: '辽宁省大连市旅顺口区海花街115-18号', district: '旅顺口区', latitude: 38.783641, longitude: 121.159798 },
  { name: '万千宠爱宠物养护专家', address: '九三路131-6号', district: '旅顺口区', latitude: 38.817717, longitude: 121.271188 },
  { name: '乐贝宠物生活馆', address: '辽宁省大连市长海县东升街中国石油东山街东北侧约100米', district: '长海县', latitude: 39.279549, longitude: 122.599243 },
  { name: '旺旺旺宠物店(联华壹号店)', address: '大连市瓦房店市锦城路联华壹号', district: '瓦房店市', latitude: 39.607098, longitude: 121.449906 },
  { name: '宠它一室宠物生活馆', address: '辽宁省大连市瓦房店市山路220号', district: '瓦房店市', latitude: 39.576495, longitude: 121.385776 },
  { name: '多多宠物会馆(龙祥新家园店)', address: '辽宁省大连市瓦房店市五一路一段310号', district: '瓦房店市', latitude: 39.625735, longitude: 121.993166 },
  { name: '乐乐宠物', address: '大连市瓦房店市转角路进步小学南侧约130米', district: '瓦房店市', latitude: 39.647439, longitude: 122.023495 },
  { name: '小马宠物生活馆', address: '大连市瓦房店市东长春路二段瓦房店师范学校西北侧约70米', district: '瓦房店市', latitude: 39.637474, longitude: 122.042442 },
  { name: '刘冰宠物店', address: '大连市瓦房店市转角路进步小学南侧约110米', district: '瓦房店市', latitude: 39.647562, longitude: 122.023566 },
  { name: '爱犬宠物店', address: '大连市瓦房店市转角路进步小学南侧约100米', district: '瓦房店市', latitude: 39.64768, longitude: 122.023578 },
  { name: '宠物美容(育红小区店)', address: '辽宁省大连市瓦房店市育才路19号', district: '瓦房店市', latitude: 39.638825, longitude: 122.013011 },
  { name: '大连犬友宠物市场', address: '大连市普兰店区兴中路塞纳名郡东北侧', district: '普兰店区', latitude: 39.4271, longitude: 121.977925 },
  { name: '馨宜动物医院(普兰店)', address: '久寿街影东小区7-4号', district: '普兰店区', latitude: 39.408116, longitude: 121.978774 },
  { name: '宠爱一生(府东街店)', address: '辽宁省大连市普兰店区皮口镇府东街64-2号', district: '普兰店区', latitude: 39.400894, longitude: 122.346034 },
  { name: '噜可宠物', address: '三川城29-3', district: '普兰店区', latitude: 39.414551, longitude: 121.961722 },
  { name: '萌萌宠物', address: '辽宁省大连市普兰店区久寿街197号', district: '普兰店区', latitude: 39.408078, longitude: 121.984716 },
  { name: '润泽宠物会馆', address: '大连市普兰店区新城街俊嘉花园西南侧约140米', district: '普兰店区', latitude: 39.402667, longitude: 121.981091 },
  { name: 'AITA宠物生活馆', address: '大连市普兰店区久寿街大连普兰店老年病医院东北侧约110米', district: '普兰店区', latitude: 39.408873, longitude: 121.975906 },
  { name: '沐宠汇宠物生活馆', address: '西工路锦秀满堂南侧约40米', district: '普兰店区', latitude: 39.413832, longitude: 121.966561 },
  { name: '祺祺宠物', address: '辽宁省大连市普兰店区商业大街110-5号', district: '普兰店区', latitude: 39.405206, longitude: 121.982718 },
  { name: '宠你一生', address: '盛麟商厦西北1门东北155米', district: '普兰店区', latitude: 39.408095, longitude: 121.977706 },
  { name: '博霖宠物', address: '大连市普兰店区世纪路中段俊嘉花园东南侧约130米', district: '普兰店区', latitude: 39.402813, longitude: 121.983528 },
];

// 获取所有区域
const districts = [...new Set(storesData.map(s => s.district))];

async function main() {
  console.log('🚀 开始初始化数据库...\n');

  try {
    // 1. 创建管理员用户
    console.log('👤 创建管理员用户...');
    const adminPassword = await bcrypt.hash('ztt@', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@pineai.cloud' },
      update: { password: adminPassword },
      create: {
        email: 'admin@pineai.cloud',
        role: UserRole.ADMIN,
        name: '系统管理员',
        password: adminPassword,
      },
    });
    console.log(`  ✓ 管理员: ${admin.email} / ztt@`);

    // 2. 创建区域
    console.log('\n📍 创建区域...');
    const regionMap: Record<string, string> = {};
    
    for (const district of districts) {
      const region = await prisma.region.upsert({
        where: { name: district },
        update: {},
        create: {
          name: district,
        },
      });
      regionMap[district] = region.id;
      console.log(`  ✓ 区域: ${district}`);
    }

    // 3. 创建门店
    console.log('\n🏪 创建门店...');
    let count = 0;
    
    for (const store of storesData) {
      await prisma.store.create({
        data: {
          name: store.name,
          address: store.address,
          regionId: regionMap[store.district],
          latitude: store.latitude,
          longitude: store.longitude,
        },
      });
      count++;
      
      if (count % 50 === 0) {
        console.log(`  已导入 ${count}/${storesData.length} 个门店...`);
      }
    }

    console.log(`\n✅ 初始化完成！`);
    console.log(`   - 管理员: admin@pineai.cloud / ztt@`);
    console.log(`   - 区域: ${districts.length} 个`);
    console.log(`   - 门店: ${storesData.length} 个`);

  } catch (error) {
    console.error('\n❌ 初始化失败:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();