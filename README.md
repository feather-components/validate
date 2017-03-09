validate 表单校验插件
================================

###Options

* dom: 检验的dom对象
* rules：规则object
* msgs: 规则对应的消息

    rule和msg的设定有2种方式：

    * 直接在html中指定 data-rule属性/data-msg

```html
<input type="text" name="abc" data-rule='{required: true, "自定义key": /abc/}' data-msg='{required: "如果对应的msg只是字符串，则表示错误时提示的文案", "自定义key": ["第一个索引指的为是错误文案", "第2个索引为正确文案，可以为空"]}' />
<input type="text" name="def" data-rule='/abc/' data-msg='rule为一个匿名规则，则对应的msg也应是匿名，错误时，显示该文案' data-default-msg="默认文案，一开始显示的文案" />
```

    * 通过rules和msgs options进行设置

```js
$('#form').validate({
    rules: {
        abc: {
            required: true,
            email: true,
            '自定义key': function(value){
                return value == 'aaa@gmail.com';
            }
        }
    },
    msgs: {
        abc: {
            required: 'xx',
            email: 'xx'
            /*自定义key的消息为空时，则发生错误不显示对应文案*/
        }
    }
});

$('#form').validate('addRule', 'username', {
    require: true
}, {
    require: 'xx'
})
```

    预设规则：

    * required: true|false
    * email: true|false
    * mobile: true|false
    * idcard: true|false
    * number: true|false
    * range: {1,100}|{1,}|{,100}
    * length: {1,100}|{1,}|{,100}|{100}
    * remote: 远程调用

```js
$('#form').validate({
    rules: {
        username: {
            remote: {
                url: '/checkUserExists',
                data: {
                    username: $('#username').val()
                },
                dataType: 'json',
                checker: function(data){
                    return data.code == 0;
                }
            }
        }
    }
})
```

* onlyFirstErrorVisible：只显示第一个错误
* ignore: 跳过的元素选择器，如 ignore: ':hidden,:disabled'
* valFormat: 校验前，对每一个需要校验的元素的值做format，返回的值则为校验的真实值

```html
$('#form').validate({
    valFormat: function(value){
        //配合placeholder插件一起使用
        if($(this).hasClass('placeholder')){
            return '';
        }

        return $.trim(value);
    }
})
```

* msgPlaceholder：显示消息的位置，默认为当前校验对象的父级下

```html
$('#form').validate({
    msgPlaceholder: function(){
        //将消息放置 当前校验的input元素父级下 class为msg-container的容器里
        return $(this).parent().find('.msg-container');
    }
})
```

* msgFormat：对消息进行format，该参数指定后，可对消息内容的显示进行定制化，默认会为fail的文案加上错误小图标，而pass的文案加上成功的小图标

```html
$('#form').validate({
    msgFormat: function(msg, type){
        if(msg != null){
            if(type == 'fail'){
                return 'xx';
            }else if(type == 'pass'){
                return 'aa';
            }else{
                //default
                return 'default';
            }
        }
    }
});
```

###Events

* pass(event, name, msg)：通过时触发，成功的元素都会触发
* fail(event, name, msg)：失败时触发

###Api

* setRules(rules, msgs)： 重新设置所有的rules
* check([name, ]callback)：检查指定元素或所有元素， callback为全部执行完毕后的回调函数

```js
$('#form').check(function(status){
    console.log('检查完毕，检查状态为:' + status);
});
```

* fail(name[, text])：手动触发一个错误
* pass(name[, text, showSuccessStatus])：手动触发成功
* reset(name[, _default])：重置一个元素的状态，可设置一个默认文本
* addRule(name[, rule, msg])：新增一个规则，name可为object
* removeRule(name)：移除一个元素的规则

###Example

```html
<form id="form">
    <p><input type="text" name="username" value="" data-rule='{required: true}' data-msg="{required: ['', '校验成功']}" data-default-msg="输入用户名" /></p>
    <p><input type="password" name="password" value="" data-msg="{remote: '远程校验失败'}" /></p>
    <input type="submit" value="submit" />
</form>
```

```js
$('#form').validate({
    rules: {
        password: {
            remote: {
                url: '/data/ajax/test.json',
                //该函数用户自行返回true|false
                checker: function(/*ajax返回的值*/){
                    return false;
                }
            }
        }
    }
}).on('validate:pass', function(event, name, msg){
    console.log('pass', name, msg);
}).on('validate:fail', function(event, name, msg){
    console.log('fail', name, msg);
}).submit(function(){
    $(this).validate('check');
    return false;
});
```