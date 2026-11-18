// Coordinates are normalized design placements on the supplied concept artwork, not official game coordinates.
export const regions=[{id:'all',name:'全部城市'},{id:'rune',name:'盧恩王國'},{id:'republic',name:'修發茲'},{id:'aruna',name:'阿盧納貝茲'},{id:'east',name:'異域城市'},{id:'other',name:'異世界'}];
export const regionNames={rune:'盧恩米德加茲王國',republic:'修發茲共和國',aruna:'阿盧納貝茲教國',east:'東方與異域特色城市',other:'異世界、貓咪島與新區域'};
export const cities=[
{id:'prontera',name:'普隆德拉',en:'Prontera',region:'rune',alias:'中央',desc:'王國首都，俗稱「中央」。王宮與大教堂所在地，也是冒險者相聚的起點。',pos:[.634,.586],icon:'♜'},
{id:'izlude',name:'伊斯魯德島',en:'Izlude',region:'rune',alias:'劍士村',desc:'王國的衛星都市，俗稱「劍士村」。在島嶼與海風之間，展開劍士的旅程。',pos:[.680,.644],icon:'⚔'},
{id:'geffen',name:'吉芬',en:'Geffen',region:'rune',desc:'魔法之都。依提供設定，這裡是法師與賢者公會所在地。',pos:[.357,.530],icon:'✧'},
{id:'morroc',name:'夢羅克',en:'Morroc',region:'rune',desc:'沙漠之都，盜賊公會所在地。城鎮與古老遺跡座落在金色沙海之中。',pos:[.464,.828],icon:'◇'},
{id:'alberta',name:'艾爾貝塔',en:'Alberta',region:'rune',desc:'港口之都，商人轉職地。從繁忙的碼頭，啟程前往遠方。',pos:[.850,.866],icon:'⚓'},
{id:'payon',name:'斐揚',en:'Payon',region:'rune',desc:'山岳之都，弓箭手的村落。依提供設定，亦為彩虹故鄉。',pos:[.755,.770],icon:'⌂'},
{id:'aldebaran',name:'艾爾帕蘭',en:'Al De Baran',region:'rune',desc:'運河之都，中央鐘塔所在地。水道穿梭城間，鐘聲為旅人指引方向。',pos:[.620,.343],icon:'◷'},
{id:'comodo',name:'克魔島',en:'Comodo',region:'rune',desc:'魔幻之島、不夜城。沿著海岸探索，走入別具氣氛的夜色。',pos:[.233,.839],icon:'☾'},
{id:'lutie',name:'烏魯斯／姜餅城',en:'Lutie',region:'rune',alias:'聖誕村',desc:'雪與聖誕的村落，玩具工廠所在地。',pos:[.891,.093],icon:'❄'},
{id:'juno',name:'朱諾',en:'Juno',region:'republic',desc:'天空之城，企業與魔法共和國的首都。',pos:[.481,.127],icon:'✦'},
{id:'einbroch',name:'艾音布羅克',en:'Einbroch',region:'republic',desc:'鋼鐵之都。工業景觀與共和國的城市生活交織於此。',pos:[.443,.282],icon:'⚙'},
{id:'einbech',name:'艾音貝赫',en:'Einbech',region:'republic',desc:'採礦村落，礦業與山地生活構成這座聚落的特色。',pos:[.563,.182],icon:'⌁'},
{id:'lighthalzen',name:'里希塔勒鎮',en:'Lighthalzen',region:'republic',desc:'企業之都。依提供設定，作為共和國的重要都市。',pos:[.326,.303],icon:'▥'},
{id:'republic-surroundings',name:'呼德姆／諾斯哈根周邊',en:'Names to be confirmed',region:'republic',desc:'使用者提供的周邊區域名稱。城市對應、譯名與位置尚待核對，先列入索引。',note:'名稱與範圍待確認',icon:'⋯'},
{id:'rachel',name:'拉赫',en:'Rachel',region:'aruna',desc:'教國首都與聖城。信仰與城市生活在此交會。',pos:[.179,.285],icon:'♜'},
{id:'veins',name:'菲音斯',en:'Veins · 譯名待核對',region:'aruna',alias:'里切塔勒 Phan-type',desc:'原始清單在共和國與教國均列有相關名稱，並有「沙漠聖城」與「邊境城市」兩種描述。暫合併為一筆，待核對正式名稱與所屬。',note:'所屬、譯名與位置待核對',icon:'◇'},
{id:'louyang',name:'洛陽',en:'Louyang',region:'east',desc:'龍之城，亦稱龍之國度。',icon:'龍'},
{id:'ayothaya',name:'艾音泰雅／哎喲泰雅',en:'Ayothaya',region:'east',desc:'具有泰國風情的古城。',icon:'⌂'},
{id:'amatsu',name:'天津',en:'Amatsu',region:'east',desc:'日本風情之城。依提供設定，為忍者與武士的故鄉。',icon:'⛩'},
{id:'brasilis',name:'巴西利斯',en:'Brasilis',region:'east',desc:'具有南美風情的都市。',icon:'❋'},
{id:'jawaii',name:'爪哇咿',en:'Jawaii',region:'east',desc:'蜜月小島，以浪漫的島嶼風情迎接旅人。',icon:'♡'},
{id:'niflheim',name:'尼芙菲姆',en:'Niflheim',region:'east',desc:'死者之都，亦稱亡靈之城。',icon:'☾'},
{id:'lasagna',name:'貓咪島',en:'Lasagna · 名稱待核對',region:'other',alias:'綿綿島 豆蔓朵',desc:'清單提供 Lasagna／綿綿島與豆蔓朵族家園的設定。先保留為待核對條目，確認是否需要拆分為不同地點。',note:'中文譯名與城市對應待確認',icon:'♧'},
{id:'splendide',name:'斯普蘭帝德',en:'Splendide',region:'other',desc:'妖精之都，異世界探索的重要城市。',icon:'✧'},
{id:'manuk',name:'曼盧克',en:'Manuk',region:'other',desc:'巨人族之都，異世界中的另一處聚落。',icon:'▲'},
{id:'isgard',name:'伊斯加爾特',en:'Isgard',region:'other',desc:'冰雪與極地的新區域城市。',icon:'❄'}
];
