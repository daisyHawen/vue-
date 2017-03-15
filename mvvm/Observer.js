var data = {
	name: 'daisyHawen'
};
observe(data);
data.name = 'dmq';

function observe(data) {
	if (!data || typeof data !== 'object') {
		return;
	}
	//取出所有属性遍历
	Object.keys(data).forEach(function(key) {
		defineReactive(data, key, data[key])
	});
};
//利用Object.defineProperty监听属性变动
function defineReactive(data, key, val) {
	observe(val);
	Object.defineProperty(data, key, {
		enumerable: true, //可枚举
		configurable: false, //不能再define
		get: function() {
			return val
		},
		set: function(newVal) {
			console.log("哈哈，监听到值变化了", val, '--->', newVal);
			val = newVal;
		}
	})
}

/*Writable 属性
当属性特性（property attribute） writable 
设置为false时，表示 non-writable，属性不能被修改。
------------------------
Enumerable 特性
属性特性 enumerable 定义了对象的属性是否可以在
 for...in 循环和 Object.keys() 中被枚举。
--------------------------
Configurable 特性
configurable 特性表示对象的属性是否可以被删除，
以及除 writable 特性外的其他特性是否可以被修改。
*/