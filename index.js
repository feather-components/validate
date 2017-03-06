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
            errorStop: false,
            ignore: '',//:disable,hidden
            trimBeforeCheck: true,
            msgPlaceholder: function(){
                return $(this).parent();
            }
        }, options || {});

        this.init();
    },

    init: function(){
        var self = this;

        self.rules = {};
        self.msgs = {};
        self.setRules(self.options.rules, self.options.msgs);
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

            return true;
        }

        self.rules[name] = $.extend(self.rules[name] || {}, Validate.analyseRule(rules));
        self.msgs[name] = $.extend(self.msgs[name] || {}, Validate.analyseMsg(msgs));
    },

    getRule: function(name){
        var self = this, rules = {}, msgs = {};
        var $element = Validate.elements(self.options.dom, name);
        var rules = Validate.decode($element.attr('data-rule')) || {}, msgs = Validate.decode($element.attr('data-msg')) || [];

        console.log(name, $.extend({}, this.rules[name] || {}, Validate.analyseRule(rules)));

        return {
            rules: $.extend({}, this.rules[name] || {}, Validate.analyseRule(rules)),
            msgs: $.extend({}, this.msgs[name] || {}, Validate.analyseMsg(msgs))
        };
    },

    check: function(name){
        var self = this, options = self.options;

        //self.reset(name, false);

        Validate.elements(self.options.dom, name).not(options.ignore).each(function(){
            var info = self.getRule(this.name);

            $.each(info.rules, function(rule, checker){
                var res = checker();

                console.log(res);

                // if(res.done){
                //     res.done(function(){
                //         console.log(arguments);
                //     });
                // }
            });
        });

        return;


        for(var index in tmpRules){
            var $tmp = self.getElement(index);

            if(!$tmp.length || $tmp.is(':disabled') || $tmp.is(':hidden') && skipHidden) continue;
            
            var item = tmpRules[index],
                value = FormValid.isCheckBtn($tmp) ? $tmp.filter(':checked').val() : $tmp.val(),
                tmpStatus = true;

            if(value == null){
                value = '';
            }

            if(!$.isArray(item)){
                item = [item];
            }

            var tmp;

            for(var i = 0; i < item.length; i++){
                tmp = item[i];

                if(typeof tmp.rule == 'function' && !tmp.rule.call(this, value, index, tmp.standard)){
                    status = false; tmpStatus = false;
                }else if(tmp.rule.constructor == RegExp && !tmp.rule.test(value)){
                    status = false; tmpStatus = false;
                }

                if(!tmpStatus){
                    self.error(index, tmp.errorText, tmp.showErrorStatus || self.options.showErrorStatus);
                    
                    if(errorStop){
                        return status;
                    }

                    break;
                }    
            } 

            tmpStatus && self.success(index, tmp.successText, tmp.showSuccessStatus || self.options.showSuccessStatus);
        }

        return status;
    },

    error: function(name, text, showErrorStatus){
        if(text != null && showErrorStatus !== false){
            text = text || '';
            this.setText(name, text || '', 'ui2-formvalid-field-error');   
        } 

        this.trigger('error', [name, text]);
    },

    success: function(name, text, showSuccessStatus){
        if(text != null && showSuccessStatus !== false){
            text = text || '';
            this.setText(name, text, 'ui2-formvalid-field-success');    
        }

        this.trigger('success', [name, text]);
    },

    setText: function(name, text, classname){
        var $parent = this.getElement(name).parent();

        $parent.find('.ui2-formvalid-field[data-formvalid-target="' + name + '"]').remove();

        if(text != null){
            $parent.append('<span class="ui2-formvalid-field ' + classname + '" data-formvalid-target="' + name + '">' + (text || '&nbsp;') + '</span>');
        }
    },

    reset: function(name, _default){
        var self = this;

        if(name){
            var text; 

            if(_default == null || _default){
                text = self.getElement(name).attr(FormValid.ATTRIBUTE_DEFAULT);
            }
            
            self.setText(name, text, 'ui2-formvalid-field-default');
        }else{
            self.getElement().each(function(){
                var name = this.name;

                if(!name) return;

                if(_default == null || _default){
                    text = $(this).attr(FormValid.ATTRIBUTE_DEFAULT);
                }

                self.setText(name, text, 'ui2-formvalid-field-default');
            });
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

Validate.elements = function(parent, name){
    if(name){
        return $('[name="' + name + '"]', parent);
    }

    return $('[name]', parent).filter(function(){
        return !!this.name;
    });
};

Validate.decode = function(str){
    try{
        return (new Function('return ' + str))();
    }catch(e){};
};

Validate.overrideRule = function(name, checker){
    var rule = Validate.RULES[name] || checker, standard = checker;

    return function(value){
        return rule.constructor == RegExp ? rule.test(name) : rule.call(this, value, standard);
    };
};

Validate.analyseRule = function(rules){
    if(rules.constructor == Object){
        $.each(rules, function(rule, checker){
            rules[rule] = Validate.overrideRule(rule, checker);
        });
    }else{
        rules = {
            _anonymous: Validate.overrideRule('_anonymous', rules)
        }
    }

    return rules;
};

Validate.analyseMsg = function(msgs){
    if(msgs.constructor == Object){
        var temp = {};

        $.each(msgs, function(name, msg){
            $.each(name.split(','), function(key, name){
                temp[name] = msg;
            })
        });

        return temp;
    }

    return {
        _anonymous: msgs
    }
};

Validate.RULES = RMS.rules || {};
Validate.MSGS = RMS.msgs || {};

Validate.isSpecialElement = function($ele){
    return $ele.length && /checkbox|radio/i.test($ele.attr('type'));
};

return Validate;
});