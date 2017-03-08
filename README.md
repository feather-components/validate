validate 表单校验插件
================================

###Options

* dom: 检验的dom对象
* rules：规则object
* msgs: 规则对应的消息
* onlyFirstErrorVisible：只显示第一个错误
* ignore: 跳过的元素选择器，如 ignore: ':hidden,:disabled'
* valFormat: 校验前，对每一个需要校验的元素的值做format，返回的值则为校验的真实值
* msgPlaceholder：显示消息的位置，默认为当前校验对象的父级下
* msgFormat：对消息进行format

###Events

* pass(event, name, msg)：通过时触发，成功的元素都会触发
* fail(event, name, msg)：失败时触发

###Api

* setRules(rules, msgs)： 重新设置所有的rules
* check([name, ]callback)：检查指定元素或所有元素， callback为全部执行完毕后的回调函数
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