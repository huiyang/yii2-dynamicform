/**
 * yii2-dynamic-form
 *
 * A jQuery plugin to clone form elements in a nested manner, maintaining accessibility.
 *
 * @author Wanderson Bragança <wanderson.wbc@gmail.com>
 */
! function($) {
    var pluginName = "yiiDynamicForm",
        regexID = /^(.+?)([-\d-]{1,})(.+)$/i,
        regexName = /(^.+?)([\[\d{1,}\]]{1,})(\[.+\]$)/i,
        regexPlaceholder = /^([\[\d{1,}\]]{1,})(?!\.)(.*[a-z])/i;
    $.fn.yiiDynamicForm = function(e) {
        return methods[e] ? methods[e].apply(this, Array.prototype.slice.call(arguments, 1)) : "object" != typeof e && e ? ($.error("Method " + e + " does not exist on jQuery.yiiDynamicForm"), !1) : methods.init.apply(this, arguments)
    };
    var events = {
            beforeInsert: "beforeInsert",
            afterInsert: "afterInsert",
            beforeDelete: "beforeDelete",
            afterDelete: "afterDelete",
            limitReached: "limitReached"
        },
        methods = {
            init: function(e) {
                return this.each(function() {
                    e.template = _parseTemplate(e)
                })
            },
            addItem: function(e, t, i) {
            	if(e.useAjax){
            		_addItemWithAjax(e, t, i)
            	}else{
            		_addItem(e, t, i)
            	}
            },
            deleteItem: function(e, t, i) {
                _deleteItem(e, t, i)
            },
            duplicateItem: function(e, t, i) {
                _duplicateItem(e, t, i)
            },
            updateContainer: function() {
                var widgetOptions = eval($(this).attr("data-dynamicform"));
                _updateAttributes(widgetOptions), _restoreSpecialJs(widgetOptions), _fixFormValidaton(widgetOptions)
            }
        },
        _parseTemplate = function(widgetOptions) {
            var $template = $(widgetOptions.template);
            $template.find("div[data-dynamicform]").each(function() {
                var widgetOptions = eval($(this).attr("data-dynamicform"));
                if ($(widgetOptions.widgetItem).length > 1) {
                    var item = $(this).find(widgetOptions.widgetItem).first()[0].outerHTML;
                    $(this).find(widgetOptions.widgetBody).html(item)
                }
            }), $template.find("input, textarea, select").each(function() {
                if ($(this).is(":checkbox") || $(this).is(":radio")) {
                    var e = $(this).is(":checkbox") ? "checkbox" : "radio",
                        t = $(this).attr("name"),
                        i = $template.find('input[type="hidden"][name="' + t + '"]').first(),
                        n = $template.find('input[type="' + e + '"][name="' + t + '"]').length;
                    i && 1 === n && ($(this).val(1), i.val(0)), $(this).prop("checked", !1)
                } else $(this).is("select") ? $(this).find("option:selected").removeAttr("selected") : $(this).val("")
            });
            var yiiActiveFormData = $("#" + widgetOptions.formId).yiiActiveForm("data");
            return yiiActiveFormData && ($template.find("." + yiiActiveFormData.settings.errorCssClass).removeClass(yiiActiveFormData.settings.errorCssClass), $template.find("." + yiiActiveFormData.settings.successCssClass).removeClass(yiiActiveFormData.settings.successCssClass)), $template
        },
        _getWidgetOptionsRoot = function(widgetOptions) {
            return eval($(widgetOptions.widgetBody).parents("div[data-dynamicform]").last().attr("data-dynamicform"))
        },
        _getLevel = function(e) {
            var t = e.parents("div[data-dynamicform]").length;
            return t = 0 > t ? 0 : t
        },
        _count = function(e, t) {
            return e.closest("." + t.widgetContainer).find(t.widgetItem).length
        },
        _createIdentifiers = function(e) {
            return new Array(e + 2).join("0").split("")
        },
        _addItem = function(e, t, i) {
            var n = _count(i, e);
            n < e.limit ? (
				$toclone = e.template,
				$newclone = $toclone.clone(!1, !1), 
        		"top" === e.insertPosition ? i.closest("." + e.widgetContainer).find(e.widgetBody).prepend($newclone) : i.closest("." + e.widgetContainer).find(e.widgetBody).append($newclone),
        		_updateAttributes(e), 
        		_restoreSpecialJs(e), 
        		_fixFormValidaton(e), 
        		i.closest("." + e.widgetContainer).triggerHandler(events.afterInsert, $newclone)) : i.closest("." + e.widgetContainer).triggerHandler(events.limitReached, e.limit)
        },
        _addItemWithAjax = function(e, t, i){
        	var n = _count(i, e);
            n < e.limit ? (
            	$.ajax({
    				url: e.ajaxUrl,
    				type:"get",
    				data: e.data,
    				success: function(data){
    					var widgetOptions = e;
    					$template = $($.parseHTML(data));
    					$template.find("input, textarea, select").each(function() {
			                if ($(this).is(":checkbox") || $(this).is(":radio")) {
			                    var e = $(this).is(":checkbox") ? "checkbox" : "radio",
			                        t = $(this).attr("name"),
			                        i = $template.find('input[type="hidden"][name="' + t + '"]').first(),
			                        n = $template.find('input[type="' + e + '"][name="' + t + '"]').length;
			                    i && 1 === n && ($(this).val(1), i.val(0)), $(this).prop("checked", !1)
			                } else $(this).is("select") ? $(this).find("option:selected").removeAttr("selected") : $(this).val("")
    			        });
			            var yiiActiveFormData = $("#" + widgetOptions.formId).yiiActiveForm("data");
			            $toclone = yiiActiveFormData && ($template.find("." + yiiActiveFormData.settings.errorCssClass).removeClass(yiiActiveFormData.settings.errorCssClass), $template.find("." + yiiActiveFormData.settings.successCssClass).removeClass(yiiActiveFormData.settings.successCssClass)), $template
			            $toclone = $template;
    					$newclone = $toclone.clone(!1, !1), 
                		"top" === e.insertPosition ? i.closest("." + e.widgetContainer).find(e.widgetBody).prepend($newclone) : i.closest("." + e.widgetContainer).find(e.widgetBody).append($newclone),
                		_updateAttributes(e), 
                		_restoreSpecialJs(e), 
                		_fixFormValidaton(e), 
                		i.closest("." + e.widgetContainer).triggerHandler(events.afterInsert, $newclone)}})) : i.closest("." + e.widgetContainer).triggerHandler(events.limitReached, e.limit)
        },
        _removeValidations = function($elem, widgetOptions, count) {
            if (count > 1) {
                $elem.find("div[data-dynamicform]").each(function() {
                    for (var currentWidgetOptions = eval($(this).attr("data-dynamicform")), level = _getLevel($(this)), identifiers = _createIdentifiers(level), numItems = $(this).find(currentWidgetOptions.widgetItem).length, i = 1; numItems - 1 >= i; i++) {
                        var aux = identifiers;
                        aux[level] = i, currentWidgetOptions.fields.forEach(function(e) {
                            var t = e.id.replace("{}", aux.join("-"));
                            "undefined" !== $("#" + currentWidgetOptions.formId).yiiActiveForm("find", t) && $("#" + currentWidgetOptions.formId).yiiActiveForm("remove", t)
                        })
                    }
                });
                var level = _getLevel($elem.closest("." + widgetOptions.widgetContainer)),
                    widgetOptionsRoot = _getWidgetOptionsRoot(widgetOptions),
                    identifiers = _createIdentifiers(level);
                identifiers[0] = $(widgetOptionsRoot.widgetItem).length - 1, identifiers[level] = count - 1, widgetOptions.fields.forEach(function(e) {
                    var t = e.id.replace("{}", identifiers.join("-"));
                    "undefined" !== $("#" + widgetOptions.formId).yiiActiveForm("find", t) && $("#" + widgetOptions.formId).yiiActiveForm("remove", t)
                })
            }
        },
        _deleteItem = function(e, t, i) {
            var n = _count(i, e);
            if (n > e.min) {
                $todelete = i.closest(e.widgetItem);
                var a = $("." + e.widgetContainer).triggerHandler(events.beforeDelete, $todelete);
                a !== !1 && (_removeValidations($todelete, e, n), $todelete.remove(), _updateAttributes(e), _restoreSpecialJs(e), _fixFormValidaton(e), $("." + e.widgetContainer).triggerHandler(events.afterDelete))
            }
        },
        _duplicateItem = function(e, t, i) {
            var n = _count(i, e);
            n < e.limit ? ($toclone = i.closest(e.widgetItem), $newclone = $toclone.clone(!1, !1), "top" === e.insertPosition ? i.closest("." + e.widgetContainer).find(e.widgetBody).prepand($newclone) : i.closest("." + e.widgetContainer).find(e.widgetBody).append($newclone), _updateAttributes(e), _restoreSpecialJs(e), _fixFormValidaton(e), i.closest("." + e.widgetContainer).triggerHandler(events.afterInsert, $newclone)) : i.closest("." + e.widgetContainer).triggerHandler(events.limitReached, e.limit)
        },
        _updateAttrID = function($elem, index) {
            var widgetOptions = eval($elem.closest("div[data-dynamicform]").attr("data-dynamicform")),
                id = $elem.attr("id"),
                newID = id;
            if (void 0 !== id) {
                var matches = id.match(regexID);
                if (matches && 4 === matches.length) {
                    matches[2] = matches[2].substring(1, matches[2].length - 1);
                    var identifiers = matches[2].split("-");
                    if (identifiers[0] = index, identifiers.length > 1) {
                        var widgetsOptions = [];
                        $elem.parents("div[data-dynamicform]").each(function(i) {
                            widgetsOptions[i] = eval($(this).attr("data-dynamicform"))
                        }), widgetsOptions = widgetsOptions.reverse();
                        for (var i = identifiers.length - 1; i >= 1; i--) "undefined" != typeof widgetsOptions[i] && (identifiers[i] = $elem.closest(widgetsOptions[i].widgetItem).index())
                    }
                    newID = matches[1] + "-" + identifiers.join("-") + "-" + matches[3], $elem.attr("id", newID)
                } else newID = id + index, $elem.attr("id", newID)
            }
            return id !== newID && ($elem.closest(widgetOptions.widgetItem).find(".field-" + id).each(function() {
                $(this).removeClass("field-" + id).addClass("field-" + newID)
            }), $elem.closest(widgetOptions.widgetItem).find("label[for='" + id + "']").attr("for", newID)), newID
        },
        _updateAttrName = function($elem, index) {
            var name = $elem.attr("name");
            if (void 0 !== name) {
                var matches = name.match(regexName);
                if (matches && 4 === matches.length) {
                    matches[2] = matches[2].replace(/\]\[/g, "-").replace(/\]|\[/g, "");
                    var identifiers = matches[2].split("-");
                    if (identifiers[0] = index, identifiers.length > 1) {
                        var widgetsOptions = [];
                        $elem.parents("div[data-dynamicform]").each(function(i) {
                            widgetsOptions[i] = eval($(this).attr("data-dynamicform"))
                        }), widgetsOptions = widgetsOptions.reverse();
                        for (var i = identifiers.length - 1; i >= 1; i--) identifiers[i] = $elem.closest(widgetsOptions[i].widgetItem).index()
                    }
                    name = matches[1] + "[" + identifiers.join("][") + "]" + matches[3], $elem.attr("name", name)
                }
            }
            return name
        },
        _updatePlaceholder = function($elem, index) {
            var placeholder = $elem.attr("placeholder");
            if (void 0 !== placeholder) {
                var matches = placeholder.match(regexPlaceholder);
                if (matches && 3 === matches.length) {
                    matches[0] = matches[0].replace(/\]\[/g, "-").replace(/\]|\[/g, "");
                    var identifiers = matches[0].split("-");
                    if (identifiers[0] = index, identifiers.length > 1) {
                        var widgetsOptions = [];
                        $elem.parents("div[data-dynamicform]").each(function(i) {
                            widgetsOptions[i] = eval($(this).attr("data-dynamicform"))
                        }), widgetsOptions = widgetsOptions.reverse();
                        for (var i = identifiers.length - 1; i >= 1; i--) identifiers[i] = $elem.closest(widgetsOptions[i].widgetItem).index()
                    }
                    placeholder = "[" + identifiers.join("][") + "]" + matches[2], $elem.attr("placeholder", placeholder)
                }
            }
            return placeholder
        },
        _updateAttributes = function(e) {
            var t = _getWidgetOptionsRoot(e);
            $(t.widgetItem).each(function(e) {
                $(this);
                $(this).find("*").each(function() {
                    _updateAttrID($(this), e), _updateAttrName($(this), e), _updatePlaceholder($(this), e)
                })
            })
        },
        _updatePlaceholderAttributes = function(e) {
            var t = _getWidgetOptionsRoot(e);
            $(t.widgetItem).each(function(e) {
                $(this);
                $(this).find("*").each(function() {
                    _updatePlaceholder($(this), e)
                })
            })
        },
        _fixFormValidatonInput = function(e, t, i, n) {
            void 0 !== t && (t = $.extend(!0, {}, t), t.id = i, t.container = ".field-" + i, t.input = "#" + i, t.name = n, t.value = $("#" + i).val(), t.status = 0, "undefined" !== $("#" + e.formId).yiiActiveForm("find", i) && $("#" + e.formId).yiiActiveForm("remove", i), $("#" + e.formId).yiiActiveForm("add", t))
        },
        _fixFormValidaton = function(widgetOptions) {
            var widgetOptionsRoot = _getWidgetOptionsRoot(widgetOptions);
            $(widgetOptionsRoot.widgetBody).find("input, textarea, select").each(function() {
                var id = $(this).attr("id"),
                    name = $(this).attr("name");
                if (void 0 !== id && void 0 !== name) {
                    currentWidgetOptions = eval($(this).closest("div[data-dynamicform]").attr("data-dynamicform"));
                    var matches = id.match(regexID);
                    if (matches && 4 === matches.length) {
                        matches[2] = matches[2].substring(1, matches[2].length - 1);
                        var level = _getLevel($(this)),
                            identifiers = _createIdentifiers(level - 1),
                            baseID = matches[1] + "-" + identifiers.join("-") + "-" + matches[3],
                            attribute = $("#" + currentWidgetOptions.formId).yiiActiveForm("find", baseID);
                        _fixFormValidatonInput(currentWidgetOptions, attribute, id, name)
                    }
                }
            })
        },
        _restoreKrajeeDepdrop = function($elem) {
            var configDepdrop = $.extend(!0, {}, eval($elem.attr("data-krajee-depdrop"))),
                inputID = $elem.attr("id"),
                matchID = inputID.match(regexID);
            if (matchID && 4 === matchID.length)
                for (index = 0; index < configDepdrop.depends.length; ++index) {
                    var match = configDepdrop.depends[index].match(regexID);
                    match && 4 === match.length && (configDepdrop.depends[index] = match[1] + matchID[2] + match[3])
                }
            $elem.depdrop(configDepdrop)
        },
        _restoreSpecialJs = function(widgetOptions) {
            var widgetOptionsRoot = _getWidgetOptionsRoot(widgetOptions),
                $hasInputmask = $(widgetOptionsRoot.widgetItem).find("[data-plugin-inputmask]");
            $hasInputmask.length > 0 && $hasInputmask.each(function() {
                $(this).inputmask("remove"), $(this).inputmask(eval($(this).attr("data-plugin-inputmask")))
            });
            var $hasDatepicker = $(widgetOptionsRoot.widgetItem).find("[data-krajee-datepicker]");
            $hasDatepicker.length > 0 && $hasDatepicker.each(function() {
                $(this).parent().removeData().datepicker("remove"), $(this).parent().datepicker(eval($(this).attr("data-krajee-datepicker")))
            });
            var $hasTimepicker = $(widgetOptionsRoot.widgetItem).find("[data-krajee-timepicker]");
            $hasTimepicker.length > 0 && $hasTimepicker.each(function() {
                $(this).removeData().off(), $(this).parent().find(".bootstrap-timepicker-widget").remove(), $(this).unbind(), $(this).timepicker(eval($(this).attr("data-krajee-timepicker")))
            });
            var $hasMaskmoney = $(widgetOptionsRoot.widgetItem).find("[data-krajee-maskMoney]");
            $hasMaskmoney.length > 0 && $hasMaskmoney.each(function() {
                $(this).parent().find("input").removeData().off();
                var id = "#" + $(this).attr("id"),
                    displayID = id + "-disp";
                $(displayID).maskMoney("destroy"), $(displayID).maskMoney(eval($(this).attr("data-krajee-maskMoney"))), $(displayID).maskMoney("mask", parseFloat($(id).val())), $(displayID).on("change", function() {
                    var e = $(displayID).maskMoney("unmasked")[0];
                    $(id).val(e), $(id).trigger("change")
                })
            });
            var $hasFileinput = $(widgetOptionsRoot.widgetItem).find("[data-krajee-fileinput]");
            $hasFileinput.length > 0 && $hasFileinput.each(function() {
                $(this).fileinput(eval($(this).attr("data-krajee-fileinput")))
            });
            var $hasTouchSpin = $(widgetOptionsRoot.widgetItem).find("[data-krajee-TouchSpin]");
            $hasTouchSpin.length > 0 && $hasTouchSpin.each(function() {
                $(this).TouchSpin("destroy"), $(this).TouchSpin(eval($(this).attr("data-krajee-TouchSpin")))
            });
            var $hasSpectrum = $(widgetOptionsRoot.widgetItem).find("[data-krajee-spectrum]");
            $hasSpectrum.length > 0 && $hasSpectrum.each(function() {
                var id = "#" + $(this).attr("id"),
                    sourceID = id + "-source";
                $(sourceID).spectrum("destroy"), $(sourceID).unbind(), $(id).unbind();
                var configSpectrum = eval($(this).attr("data-krajee-spectrum"));
                configSpectrum.change = function(e) {
                    jQuery(id).val(e.toString())
                }, $(sourceID).attr("name", $(sourceID).attr("id")), $(sourceID).spectrum(configSpectrum), $(sourceID).spectrum("set", jQuery(id).val()), $(id).on("change", function() {
                    $(sourceID).spectrum("set", jQuery(id).val())
                })
            });
            var $hasDepdrop = $(widgetOptionsRoot.widgetItem).find("[data-krajee-depdrop]");
            $hasDepdrop.length > 0 && $hasDepdrop.each(function() {
                void 0 === $(this).data("select2") && ($(this).removeData().off(), $(this).unbind(), _restoreKrajeeDepdrop($(this)))
            });
            var $hasSelect2 = $(widgetOptionsRoot.widgetItem).find("[data-krajee-select2]");
            $hasSelect2.length > 0 && $hasSelect2.each(function() {
                var id = $(this).attr("id"),
                    configSelect2 = eval($(this).attr("data-krajee-select2"));
                $(this).data("select2") && $(this).select2("destroy");
                var configDepdrop = $(this).data("depdrop");
                configDepdrop && (configDepdrop = $.extend(!0, {}, configDepdrop), $(this).removeData().off(), $(this).unbind(), _restoreKrajeeDepdrop($(this))), $.when($("#" + id).select2(configSelect2)).done(initS2Loading(id, ".select2-container--krajee"));
                var kvClose = "kv_close_" + id.replace(/\-/g, "_");
                if ($("#" + id).on("select2:opening", function(e) {
                        initS2Open(id, kvClose, e)
                    }), $("#" + id).on("select2:unselect", function() {
                        window[kvClose] = !0
                    }), configDepdrop) {
                    var loadingText = configDepdrop.loadingText ? configDepdrop.loadingText : "Loading ...";
                    initDepdropS2(id, loadingText)
                }
            })
        }
}(window.jQuery);