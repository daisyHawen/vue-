/*
//使用_proto_
Object.defineProperty(obj, "key", {
	_proto_: null, //没有继承的属性
	value: "static", //没有enumerate
	//没有configurable
	//没有writable
	//作为默认值
})

//显示
Object.defineProperty(obj, "key", {
	enumerable: false,
	configurable: false,
	writable: false,
	value: 'static'
})
console.log(key);
*/
//如何使用Object.defineProperty

var o = {} //创建一个新对象
Object.defineProperty(o, "a", {
	value: 37,
	writable: false, //设置只读 ，不能再赋值
	enumerable: true,
	configurable: false,
	// get: function() {
	// 	console.log("get a");
	// },
	// set: function(newValue) {
	// 	console.log("set a"); 
	//Cannot both specify accessors and a value or writable attribute, #<Object>
	// }
});
//对象拥有了属性a，值为37
console.log(o);

var bValue;
Object.defineProperty(o, "b", {
	get: function() {
		console.log("get");
		return bValue;
	},
	set: function(newValue) {
		console.log("set");
		bValue = newValue;
	},
	enumerable: true,
	configurable: true
})
o.b = 38; //set
console.log(o.b); //get
console.log(o); //{ a: 37, b: [Getter/Setter] }