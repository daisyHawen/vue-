 //那么将需要observe的数据对象进行递归遍历，
 //包括子属性对象的属性，都加上 setter和getter
 //这样的话，给这个对象的某个值赋值，
 //就会触发setter，那么就能监听到了数据变化

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
 	observe(val); //监听子属性

 	Object.defineProperty(data, key, {
 		enumerable: true, //可枚举
 		configurable: false, //不能再define
 		get: function() {
 			// 由于需要在闭包内添加watcher，所以通过Dep定义一个全局target属性，暂存watcher, 添加完移除
 			Dep.target && dep.addDep(Dep.target)
 			return val
 		},
 		set: function(newVal) {
 			if (val === newVal) return; // 没有变化
 			console.log("哈哈，监听到值变化了", val, '--->', newVal);
 			val = newVal;
 			dep.notify(); //通知所有订阅者
 		}
 	})
 }

 function Dep() {
 	this.subs = [];
 }
 Dep.prototype = {
 	addSub: function(sub) {
 		this.subs.push(sub) //添加订阅者
 	},
 	notify: function() {
 		//通知所有的订阅者消息
 		this.subs.forEach(function(sub) {
 			sub.update();
 		})
 	}
 }
 Watcher.prototype = {
 	get: function(key) {
 		Dep.target = this;
 		this.value = data[key];
 		Dep.target = null;
 	}
 }