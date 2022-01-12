import { Icon } from '@alifd/next';
import { api } from '@/api.json';
const CustomIcon = Icon.createFromIconfontCN({
	scriptUrl: `${api}/images/middleware/iconfont.js`
});
export default CustomIcon;
