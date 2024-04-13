// Đối tượng validator
function Validator(option) {

    function getParent(element, selector) {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement;
            };
            element = element.parentElement;
        };
    };

    var selectorRules = {};

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        // value: inputElement.value
        // test func: rule.test
        var erorrElement = getParent(inputElement, option.formGroupSelector).querySelector(option.errorSelector);
        var errorMessege;
        
        // Lấy ra rules của selector
        var rules = selectorRules[rule.selector];

        // Lặp qua từng rule & kiểm tra
        // Nếu có lỗi dừng việc kiểm tra
        for (var i = 0; i < rules.length; i++) {
            switch (inputElement.type) {
                case 'radio':
                case 'checkbox':
                    errorMessege = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    );
                    break;
                default:
                    errorMessege = rules[i](inputElement.value);
            }
            if (errorMessege) break;
        }
        
        if (errorMessege) {
            erorrElement.innerText = errorMessege;
            getParent(inputElement, option.formGroupSelector).classList.add('invalid');
        } else {
            erorrElement.innerText = '';
            getParent(inputElement, option.formGroupSelector).classList.remove('invalid');
        };

        return !errorMessege;
    };

    // Lấy element của form cần validate
    var formElement = document.querySelector(option.form);

    if (formElement) {

        // Khi submit form
        formElement.onsubmit = function(e) {
            e.preventDefault();
            
            var isFormValid = true;

            // Lặp qua từng rule & validate
            option.rules.forEach(function (rule) {
                var inputElement = formElement.querySelector(rule.selector);
                var isValid = validate(inputElement, rule);
                if (!isValid) {
                    isFormValid = false;
                };
            });
 
            if (isFormValid) {
                // Trường hợp submit với JS
                if (typeof option.onSubmit === 'function') {
                    var enableInputs = formElement.querySelectorAll('[name]');
                    var formValues = Array.from(enableInputs).reduce(function (values, input) {

                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name="' + input.name + '"]:checked');
                                break;
                            case 'checkbox':
                                if (!input.matches(':checked')) {
                                    values[input.name] = '';
                                    return values
                                };
                                if (!Array.isArray(values[input.name])) {
                                    values[input.name] = [];
                                };
                                values[input.name].push(input.value);
                                break;
                            case 'file':
                                values[input.name] = input.files;
                                break;
                            default:
                                values[input.name] = input.value;
                        }
                        return values;
                    }, {});
                    option.onSubmit(formValues);
                }
                // Trường hợp submit với hành vi mặc định
                else {
                    formElement.submit();
                };
            };
        };

        // Lặp qua mỗi rule và xử lí (lắng nghe sự kiện blur, input,...)
        option.rules.forEach(function (rule) {

            var inputElements = formElement.querySelectorAll(rule.selector);

            Array.from(inputElements).forEach(function (inputElement) {
                // Xử lí trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };

                // Xử lí khi user nhập vào input
                inputElement.oninput = function () {
                    var erorrElement = getParent(inputElement, option.formGroupSelector).querySelector(option.errorSelector);
                    erorrElement.innerText = '';
                    getParent(inputElement, option.formGroupSelector).classList.remove('invalid');
                };
            });

            // Lưu lại rules cho mỗi input
            if (Array.isArray(selectorRules[rule.selector])) {
                selectorRules[rule.selector].push(rule.test);
            } else {
                selectorRules[rule.selector] = [rule.test];
            };

        });
    };
};

// Định nghĩa rules
// Nguyên tắc của các rules:
// 1.Khi có lỗi => trả ra mesage lỗi
// 2. Khi hợp lệ => không trả ra cái gì cả (undefined)
Validator.isRequired = function (selector, mesage) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : mesage || 'Vui lòng nhập trường này';
        }
    }
};

Validator.isEmail = function (selector, mesage) {
    return {
        selector: selector,
        test: function (value) {
            var regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            return regex.test(value) ? undefined : mesage || 'Trường này là email';
        }
    }
};

Validator.minLength = function (selector, min, mesage) {
    return {
        selector: selector,
        test: function (value) {
            return value.length >= min ? undefined : mesage || `Nhập tối thiểu ${min} kí tự`;
        }
    }
};

Validator.isConfirmed = function (selector, getConfirmValue, mesage) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : mesage || 'Giá trị nhập lại không chính xác';
        }
    }
};

Validator({
    form: '#form-1',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [
        Validator.isRequired('#fullname'),
        Validator.isRequired('#email'),
        Validator.isEmail('#email'),
        Validator.isRequired('#password'),
        Validator.minLength('#password', 6),
        Validator.isRequired('#password_confirmation'),
        Validator.isConfirmed('#password_confirmation', function () {
            return document.querySelector('#form-1 #password').value;
        }, 'Mật khẩu nhập lại không chính xác'),
        Validator.isRequired('input[name="gender"]'),
        Validator.isRequired('#province'),
    ],
    onSubmit: function(data) {
        // Call API
        console.log(data);
    }
});

Validator({
    form: '#form-2',
    formGroupSelector: '.form-group',
    errorSelector: '.form-message',
    rules: [
        Validator.isRequired('#email'),
        Validator.isEmail('#email'),
        Validator.isRequired('#password'),
        Validator.minLength('#password', 6),
    ],
    onSubmit: function(data) {
        // Call API
        console.log(data);
    }
});