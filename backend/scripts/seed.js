/**
 * 种子数据脚本 - JavaScript 版本
 * 可直接运行: node scripts/seed.js
 */

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

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
  { name: '珍爱宠物诊所(苏州小区北区店)', address: '苏州街41号1层1号，2号', district: '沙河口区', latitude: 38.890891, longitude: 121.56563 },
  { name: '美联众合动物医院(黄河路瑞美分院)', address: '辽宁省大连市沙河口区黄河路520号中山公园南门斜对面', district: '沙河口区', latitude: 38.916942, longitude: 121.606141 },
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
  { name: '萌尚宠物(交大店)', address: '辽宁省大连市沙河口区兴工街道西林街32号101', district: '沙河口区', latitude: 38.92354, longitude: 121.579369 },
  { name: '毛孩宠物店', address: '学府南街高安里38栋1楼5号', district: '金州区', latitude: 39.074815, longitude: 121.828126 },
  { name: '金宝宝宠物', address: '辽宁省大连市金州区黄海西四路86号', district: '金州区', latitude: 39.059273, longitude: 121.804891 },
  { name: '爱尚萌宠物', address: '和平路84号1单元1层店铺', district: '金州区', latitude: 39.111906, longitude: 121.71499 },
  { name: 'D&C宠堡(亿锋广场店)', address: '亿锋广场三期赤峰街50-1号', district: '金州区', latitude: 39.052682, longitude: 121.757687 },
  { name: '卖萌(万达广场店)', address: '辽河西路117号万达广场大连开发区店F1层', district: '金州区', latitude: 39.065499, longitude: 121.789223 },
  { name: '亲亲宠物店(西河商城店)', address: '辽宁省大连市金州区北山路650-58号', district: '金州区', latitude: 39.109373, longitude: 121.71752 },
  { name: '恩宠宠物诊所', address: '辽宁省大连市金州区同济路胜利西小区44号', district: '金州区', latitude: 39.105906, longitude: 121.716966 },
  { name: '小柏宠物用品(和平小区店)', address: '光明街道和平路228号2单元2层1号楼下底仓', district: '金州区', latitude: 39.111443, longitude: 121.720448 },
  { name: '康旺宠物诊所(古城丁区店)', address: '古城丁区53号楼公建康旺宠物诊所', district: '金州区', latitude: 39.12069, longitude: 121.71841 },
  { name: '宠光年宠物(开发区店)', address: '辽宁省大连市金州区盘锦路金棕榈5栋4号', district: '金州区', latitude: 39.053584, longitude: 121.767263 },
  { name: '关爱宠物医院(大连金州区)', address: '金马路450号', district: '金州区', latitude: 39.048338, longitude: 121.803688 },
  { name: '七月萌宠', address: '经济技术开发区湾里南18-14号', district: '金州区', latitude: 39.070797, longitude: 121.858887 },
  { name: '旺迪宠物医院', address: '经济技术开发区金马路169-6-9号', district: '金州区', latitude: 39.057807, longitude: 121.783341 },
  { name: '兴旺宠物医院(黄海西路店)', address: '开发区黄海西路155-2号', district: '金州区', latitude: 39.048529, longitude: 121.776888 },
  { name: '云宠吖宠物', address: '辽宁省大连市金州区黄海西路新辰里3号楼4单元1~2号', district: '金州区', latitude: 39.050349, longitude: 121.796932 },
  { name: '小胃一家宠物生活馆', address: '润海园东区25-2号1层', district: '金州区', latitude: 39.03948, longitude: 121.775753 },
  { name: '优加宠物门诊', address: '开发区赤峰街17-3号', district: '金州区', latitude: 39.052305, longitude: 121.761109 },
  { name: '家有萌宠用品屋', address: '辽宁省大连市金州区湾里街道经济技术开发区东城园8栋-4号', district: '金州区', latitude: 39.069486, longitude: 121.848521 },
  { name: '毛毛宠宠物店', address: '辽宁省大连市金州区湾里街道东城园55栋6号', district: '金州区', latitude: 39.072243, longitude: 121.847491 },
  { name: '宠派宠物生活馆', address: '金石滩大连经济技术开发区之江路55-7号1层', district: '金州区', latitude: 39.102116, longitude: 122.033773 },
  { name: '宠它美容生活馆(高民里店)', address: '辽宁省大连市金州区高志街高民里31号楼', district: '金州区', latitude: 39.06937, longitude: 121.831972 },
  { name: '趣宠宠物', address: '大连市庄河市延安路金鹏家园', district: '庄河市', latitude: 39.696471, longitude: 122.984229 },
  { name: '八福宠物店', address: '工五街一号楼（香炉礁社区卫生院东二十米）', district: '西岗区', latitude: 38.936538, longitude: 121.60317 },
  { name: '小坏蛋宠物馆(石葵路店)', address: '石葵路18号楼1-1室', district: '西岗区', latitude: 38.901864, longitude: 121.632593 },
  { name: '乔乔的宠物店', address: '鞍山路27-3号', district: '西岗区', latitude: 38.927484, longitude: 121.61888 },
  { name: '这里有家宠物店(拥警街店)', address: '白云街道拥政北街14号(铁路中学对面)', district: '西岗区', latitude: 38.910487, longitude: 121.609975 },
  { name: '咕得宠物美容店', address: '绕山路73号', district: '西岗区', latitude: 38.901516, longitude: 121.611666 },
  { name: '毛球宠物生活馆', address: '八一路(盘山街4号)猫屿咖啡店', district: '西岗区', latitude: 38.892419, longitude: 121.655101 },
  { name: '太仔宠物', address: '长江路612号', district: '西岗区', latitude: 38.92457, longitude: 121.620614 },
  { name: 'Bo Pet私宠会所', address: '北京街22-5号北京公园1区西门旁', district: '西岗区', latitude: 38.926275, longitude: 121.61894 },
  { name: '若然小屋', address: '功勋街一号楼5单元103', district: '西岗区', latitude: 38.937522, longitude: 121.643509 },
  { name: 'HANA宠物生活馆', address: '辽宁省大连市西岗区沈阳路43号', district: '西岗区', latitude: 38.922562, longitude: 121.617104 },
  { name: '壹猫壹狗宠物生活馆(红馆小区店)', address: '北海街12号', district: '西岗区', latitude: 38.937637, longitude: 121.642444 },
  { name: '宠乐宠物(新春街店)', address: '辽宁省大连市西岗区新春街38号1层', district: '西岗区', latitude: 38.920865, longitude: 121.618056 },
  { name: '天喜宠物吧', address: '三元街20号', district: '西岗区', latitude: 38.915889, longitude: 121.631913 },
  { name: '海美宠物', address: '解放路岭前街35号(桃源地铁站D口步行340米)', district: '中山区', latitude: 38.896499, longitude: 121.656961 },
  { name: '爱派特动物医院·全科诊疗中心', address: '武汉街70号（大通证券、住房公积金对面）', district: '中山区', latitude: 38.921901, longitude: 121.646638 },
  { name: '中宝连锁兴旺宠物医院', address: '鲁迅路121号', district: '中山区', latitude: 38.926016, longitude: 121.670378 },
  { name: '宠物巷宠物生活馆', address: '武昌街404号', district: '中山区', latitude: 38.914558, longitude: 121.654373 },
  { name: '宠爱宠物生活馆(春德街店)', address: '春德街96号1-2层2号公建', district: '中山区', latitude: 38.923545, longitude: 121.676506 },
  { name: '小哼宠物生活馆', address: '怡和街山屏社区北侧约130米', district: '中山区', latitude: 38.910109, longitude: 121.68419 },
  { name: '兜宠宠物生活馆', address: '大连市中南路怡和街19号楼1单元101', district: '中山区', latitude: 38.91133, longitude: 121.68379 },
  { name: '添宝宠物', address: '华乐街105号', district: '中山区', latitude: 38.921289, longitude: 121.687967 },
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
        role: 'ADMIN',
        name: '系统管理员',
        password: adminPassword,
      },
    });
    console.log(`  ✓ 管理员: ${admin.email} / ztt@`);

    // 2. 创建区域
    console.log('\n📍 创建区域...');
    const regionMap = {};
    
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