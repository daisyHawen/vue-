##什么是双向绑定
在vue中，实现一个mvvm的双向绑定很简单


```
<div id="mvvm-app">
    <input type="text" v-model="word">
    <p>{{word}}</p>
    <button v-on:click="sayHi">change model</button>
</div>

<script src="./js/observer.js"></script>
<script src="./js/watcher.js"></script>
<script src="./js/compile.js"></script>
<script src="./js/mvvm.js"></script>
<script>
    var vm = new MVVM({
        el: '#mvvm-app',
        data: {
            word: 'Hello World!'
        },
        methods: {
            sayHi: function() {
                this.word = 'Hi, everybody!';
            }
        }
    });
</script>
```

这里演示了一旦我们改变了word，那么视图中的与word绑定的也就自动更新了。
## 几种实现双向绑定的做法
目前几种主流的mvc(vm)框架都实现了单向数据绑定，而我所理解的双向数据绑定无非就是在单向绑定的基础上给可输入元素（input、textare等）添加了change(input)事件，来动态修改model和 view，并没有多高深。所以无需太过介怀是实现的单向或双向绑定。

实现数据绑定的做法有大致如下几种：

> - 发布者-订阅者模式（backbone.js）
> - 脏值检查（angular.js）
> - 数据劫持（vue.js）
> 
> - 发布者-订阅者模式: 一般通过sub,pub的方式实现数据和视图的绑定监听，更新数据方式通常做法是 vm.set('property', value)，这里有篇文章讲的比较详细，有兴趣可点这里

这种方式现在毕竟太low了，我们更希望通过 vm.property = value 这种方式更新数据，同时自动更新视图，于是有了下面两种方式

**脏值检查:**
 angular.js 是通过脏值检测的方式比对数据是否有变更，来决定是否更新视图，最简单的方式就是通过 setInterval() 定时轮询检测数据变动，当然Google不会这么low，angular只有在指定的事件触发时进入脏值检测，大致如下：
   DOM事件，譬如用户输入文本，点击按钮等。( ng-click )   ； 
 
   XHR响应事件 ( $http ) 浏览器Location变更事件( $location )  ；  
 
   Timer事件( $timeout , $interval ) 执行 $digest() 或$apply()； 


**数据劫持:**
 vue.js 则是采用数据劫持结合发布者-订阅者模式的方式，通过Object.defineProperty()来劫持各个属性的setter，getter，在数据变动时发布消息给订阅者，触发相应的监听回调。

## 思路整理——如何实现
已经了解到vue是通过数据劫持的方式来做数据绑定的，其中最核心的方法便是通过Object.defineProperty()来实现对属性的劫持，达到监听数据变动的目的，无疑这个方法是本文中最重要、最基础的内容之一，如果不熟悉defineProperty，猛戳这里
整理了一下，要实现mvvm的双向绑定，就必须要实现以下几点：
1、实现一个数据监听器Observer，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
2、实现一个指令解析器Compile，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数
3、实现一个Watcher，作为连接Observer和Compile的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图
4、mvvm入口函数，整合以上三者

## Observe的实现->Observe.js

说明： Object.defineProperty() 方法会直接在一个对象上定义一个新属性，或者修改一个已经存在的属性， 并返回这个对象。
```
Object.defineProperty(obj, prop, descriptor)
```

obj:需要定义属性的对象
prop：需定义或修改的属性的名字
descriptor:将被定义或修改的属性的描述符
返回值：返回传入函数的对象，即第一个参数obj

**数据描述符和存取描述符**均具有以下可选键值：



- **configurable**
当且仅当该属性的 configurable 为 true 时，该属性描述符才能够被改变，也能够被删除。默认为 false。
- **enumerable**
当且仅当该属性的 enumerable 为 true 时，该属性才能够出现在对象的枚举属性中。默认为 false。
数据描述符同时具有以下可选键值：

- **value**
该属性对应的值。可以是任何有效的 JavaScript 值（数值，对象，函数等）。默认为 undefined。

- **writable**
当且仅当该属性的 writable 为 true 时，该属性才能被赋值运算符改变。默认为 false。
存取描述符同时具有以下可选键值：

- **get**
一个给属性提供 getter 的方法，如果没有 getter 则为 undefined。该方法返回值被用作属性值。默认为 undefined。

- **set**
一个给属性提供 setter 的方法，如果没有 setter 则为 undefined。该方法将接受唯一参数，并将该参数的新值分配给该属性。默认为 undefined。
记住，这些选项不一定是自身属性，如果是继承来的也要考

这里讲一下Object.defineProperty，真的是一个神奇的函数。它实质上是为

```
var o = {} //创建一个新对象
Object.defineProperty(o, "a", {
    value: 37,
    writable: false, //设置只读 ，不能再赋值
    enumerable: true,
    configurable: false,
    // get: function() {
    //  console.log("get a");
    // },
    // set: function(newValue) {
    //  console.log("set a"); 
    //如果为这个里面设置get和set的话会报错：
    //Cannot both specify accessors and a value or writable attribute, #<Object>
    //不能同时指定访问器和值或可写属性
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
```
如果设置了value，就不能使用set这个属性了

```
// 数据描述符和存取描述符不能混合使用
Object.defineProperty(o, "conflict", { value: 0x9f91102, 
                                       get: function() { return 0xdeadbeef; } });
// throws a TypeError: value appears only in data descriptors, get appears only in accessor descriptors
```

可以看到每次读取o.b，实质上是调用Object.getter方法，设置o.b就是调用setter。
因此通过Object.defineProperty实现的监听

```
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

```
