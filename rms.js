;(function(factory){
if(typeof define == 'function' && define.amd){
    //seajs or requirejs environment
    define([], factory);
}else if(typeof module === 'object' && typeof module.exports == 'object'){
    module.exports = factory();
}else{
    this.RMS = factory();
}
})(function(){
return {
    rules: {
        required: /\S+/,
        email: /^\w[\._\-\w]*@[\w_-]+(?:\.[\w_-]+)+$/i,
        mobile: /^\d{11}$/,
        idcard: /^(?:\d{14}|\d{17})[\dx]$/i,
        number: /^(?:\d+(?:\.\d+)?)$/,
        range: function(value, range){
            if(!value) return true;

            range = range.replace(/\s+/g, '').split(',');

            if(range[0] && value < r[0]){
                return false; 
            }

            if(range[1] && value > r[1]){
                return false;
            }

            return true;
        },
        length: function(value, range){
            if(value){
                return (new RegExp('[\\s\\S]{' + range + '}')).test(value);
            }

            return true;
        },
        remote: function(value, options){
            return $.ajax(options).always(function(){
                console.log('success', arguments);
            }, function(){
                console.log('error', arguments);
            }, function(){
                 console.log('error', arguments);
            });
        }
    },

    msgs: {
        required: '该字段必填',
        email: '邮箱格式错误',
        mobile: '手机号码格式错误',
        idcard: '身份证格式错误',
        number: '该字段必须为数字',
        range: '字段输入范围错误',
        length: '字段输入长度错误'
    }
};
});      