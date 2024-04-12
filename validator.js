// Đối tượng validator
function Validator(option) {

    // Hàm thực hiện validate
    function validate(inputElement, rule) {
        // value: inputElement.value
        // test func: rule.test
        var errorMessege = rule.test(inputElement.value)
        var erorrElement = inputElement.parentElement.querySelector(option.errorSelector);
        if (errorMessege) {
            erorrElement.innerText = errorMessege;
            inputElement.parentElement.classList.add('invalid');
        } else {
            erorrElement.innerText = '';
            inputElement.parentElement.classList.remove('invalid');
        };
    };

    // Lấy element của form cần validate
    var formElement = document.querySelector(option.form);
    if (formElement) {
        option.rules.forEach(function (rule) {
            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                // Xử lí trường hợp blur khỏi input
                inputElement.onblur = function () {
                    validate(inputElement, rule);
                };

                // Xử lí khi user nhập vào input
                inputElement.oninput = function () {
                    var erorrElement = inputElement.parentElement.querySelector(option.errorSelector);
                    erorrElement.innerText = '';
                    inputElement.parentElement.classList.remove('invalid');
                };
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
            return value.trim() ? undefined : mesage || 'Vui lòng nhập trường này';
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
    errorSelector: '.form-message',
    rules: [
        Validator.isRequired('#fullname'),
        Validator.isEmail('#email'),
        Validator.minLength('#password', 6),
        Validator.isConfirmed('#password_confirmation', function () {
            return document.querySelector('#form-1 #password').value;
        }, 'Mật khẩu nhập lại không chính xác'),
    ]
});