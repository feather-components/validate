;(function(factory){
if(typeof define == 'function' && define.amd){
    //seajs or requirejs environment
    define(['jquery', 'class', './rms'], factory);
}else if(typeof module === 'object' && typeof module.exports == 'object'){
    module.exports = factory(
        require('jquery'),
        require('class'),
        require('./rms')
    );
}else{
    factory(window.jQuery, window.jQuery.klass, window.RMS || {});
}
})(function($, Class, RMS){
var Validate = Class.$factory('validate', {
    initialize: function(options){
        this.options = $.extend({
            dom: null,
            rules: {},
            msgs: {},
            onlyFirstErrorVisible: false,
            ignore: '',//:disable,hidden
            valFormat: function(value){
                return $.trim(value);
            },
            msgPlaceholder: function(){
                return $(this).parent();
            },
            msgFormat: function(msg, type){
                if(msg != null){
                    if(type == 'fail' || type == 'pass'){
                        msg = '<i class="ui3-validate-icon">&nbsp;</i>' + msg;
                    }

                    return msg;
                }
            },
            msgClassName: ''
        }, options || {});

        this.init();
    },

    init: function(){
        var self = this;

        self.rules = {};
        self.msgs = {};
        self.setRules(self.options.rules, self.options.msgs);
        self.reset();
    },

    setRules: function(rules, msgs){
        var self = this;

        self.removeRule();
        self.addRule(rules, msgs || {});
    },

    //{username: {required: true}}, {username: {required: 'username is required！'}}
    //username, {required: true}, {required: 'username is required!'} 
    addRule: function(name, rules, msgs){
        var self = this;

        if($.isPlainObject(name)){
            msgs = rules;
            rules = name;
        
            $.each(rules, function(name, rules){
                self.addRule(name, rules, $.isPlainObject(msgs) ? (msgs[name] || '') : msgs);
            });

            return;
        }

        self.rules[name] = self.getRule(name, false, rules);
        self.msgs[name] = self.getRule(name, false, msgs);
    },

    getRule: function(name, exceptInlineRule, extraRules){
        var inlineRules;

        if(!exceptInlineRule){
            inlineRules = Validate.decode(this.$(name).attr('data-rule'));
        }

        return $.extend({}, this.rules[name] || {}, Validate.analyseRule(inlineRules), Validate.analyseRule(extraRules));
    },

    getMsg: function(name, exceptInlineMsg, extraMsgs){
        var inlineMsgs;

        if(!exceptInlineMsg){
            inlineMsgs = Validate.decode(this.$(name).attr('data-msg'));
        }

        return $.extend({}, Validate.analyseMsg(Validate.MSGS), this.msgs[name] || {}, Validate.analyseMsg(inlineMsgs), Validate.analyseMsg(extraMsgs));
    },

    check: function(name, rule, msg, callback){
        if(typeof msg == 'function'){
            callback = msg;
            msg = null;
        }else if(typeof name == 'function'){
            callback = name;
            name = null;
        }else{
            callback = function(){};
        }

        var self = this;
        var options = self.options, onlyFirstErrorVisible = options.onlyFirstErrorVisible, firstErrorIsTrigger = false;
        var $elements = self.$(name).not(options.ignore);

        if(!$elements.length){
            callback(true);
            return;
        }

        self.reset(name);

        var names = [], promiseList = [];

        $elements.each(function(){
            names.push(this.name);
        });

        $.each($.unique(names), function(index, name){
            var rules = rule ? Validate.analyseRule(rule) : self.getRule(name);
            var msgs = self.getMsg(name, false, msgs);
            var $element = self.$(name);

            if(Validate.isSpecialElement($element)){
                $element = $element.is(':checked');
            }

            var element = $element.get(0);
            var value = options.valFormat.call(element, element.value);
            var defer = $.Deferred().resolve('check [' + name + '] start!'), promise = defer.promise();

            $.each(rules, function(ruleName, checker){ 
                promise = promise.then(function(){
                    return checker.call(element, value).then(function(){
                        var msg = (msgs[ruleName] || [])[1];
                        return [name, msg];
                    }, function(){
                        var msg = (msgs[ruleName] || [])[0];
                        return [name, msg];
                    });
                });
            });

            promise.then(function(arg){
                self.pass(arg[0], arg[1]);
            }, function(arg){
                if(!onlyFirstErrorVisible || !firstErrorIsTrigger){
                    self.fail(arg[0], arg[1]);
                    firstErrorIsTrigger = true;
                }
            });

            promiseList.push(promise);
        });

        $.when.apply($, promiseList).done(function(){
            callback(true);
        }).fail(function(){
            callback(false);
        });
    },

    $: function(name){
        var parent = this.options.dom;

        if(name){
            return $('[name="' + name + '"]', parent);
        }

        return $('[name]', parent).filter(function(){
            return !!this.name;
        });
    },

    fail: function(name, msg){
        var self = this, element = self.$(name);
        
        self.trigger('fail', [name, msg]);
        self.showMsg(name, msg, 'fail');
    },

    pass: function(name, msg){
        var self = this, element = self.$(name);
        
        self.trigger('pass', [name, msg]);
        self.showMsg(name, msg, 'pass');
    },

    showMsg: function(name, msg, type){
        var self = this, options = self.options;
        var element = self.$(name).get(0), $placeholder = $(options.msgPlaceholder.call(element));

        $placeholder.find('.ui3-validate-msg').remove();

        msg = options.msgFormat.call(element, msg, type);

        if(msg == null) return;

        $('<span class="ui3-validate-msg ' + (type ? 'ui3-validate-' + type : '') + '">' + msg + '</span>').addClass(options.msgClassName).appendTo($placeholder);
    },

    reset: function(name, _default){
        var self = this;

        if(name){            
            self.showMsg(name, _default || self.$(name).attr('data-default-msg'));
        }else{
            self.$().each(function(){
                self.reset(this.name);
            })
        }
    },

    removeRule: function(name){
        if(name){
            delete this.rules[name];
        }else{
            this.rules = {};
        }
    }
});

Validate.decode = function(str){
    try{
        return (new Function('return ' + str))();
    }catch(e){};

    return str;
};

Validate.overrideRule = function(name, checker){
    var rule = Validate.RULES[name] || checker, standard = checker;

    return function(value){
        var res = rule.constructor == RegExp ? rule.test(value) : rule.call(this, value, standard);

        if(typeof res.promise == 'function'){
            return res.then(function(res){
                var defer = $.Deferred();
                res ? defer.resolve(name) : defer.reject(name);
                return defer.promise();
            });
        }

        var defer = $.Deferred();
        res ? defer.resolve(name) : defer.reject(name);
        return defer.promise();
    };
};

Validate.analyseRule = function(rules){
    if(!rules) return {};

    if(rules.constructor == Object){
        $.each(rules, function(rule, checker){
            rules[rule] = Validate.overrideRule(rule, checker);
        });

        return rules;
    }

    var name = typeof rules == 'string' && Validate.RULES[rules] ? Validate.RULES[rules] : '_anonymous';
    var reRules = {};

    reRules[name] = Validate.overrideRule(name, rules);
    return reRules;
};

Validate.analyseMsg = function(msgs){
    if(!msgs) return {};

    if(msgs.constructor == Object){
        var temp = {};

        $.each(msgs, function(name, msg){
            msg = $.makeArray(msg);

            $.each(name.split(','), function(key, name){
                temp[name] = msg;
            })
        });

        return temp;
    }

    return {
        _anonymous: $.makeArray(msgs)
    };
};

Validate.RULES = RMS.rules || {};
Validate.MSGS = RMS.msgs || {};

Validate.isSpecialElement = function($ele){
    return $ele.length && /checkbox|radio/i.test($ele.attr('type'));
};

return Validate;
});