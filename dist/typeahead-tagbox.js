'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.default = typeaheadTagbox;
function typeaheadTagbox(options) {
    options = Object.assign({
        caseSensitive: false,
        data: [],
        dropdownClass: 'typeahead-dropdown',
        dropdownItemClass: 'typeahead-dropdown-item',
        dropdownItemTemplate: '{{text}}',
        dropdownSelectedClass: 'selected',
        highlightClass: 'typeahead-highlight',
        idKey: 'id',
        inputClass: 'typeahead-input',
        inputPlaceholder: 'add...',
        minLength: 2,
        onAddTag: undefined, // (tag, taglist) => {},
        onClickDropdownOption: undefined, // (option) => {},
        onOpenDropdown: undefined, // (value, optionlist) => {},
        onRemoveTag: undefined, // (tag, taglist) => {},
        selector: '.typeahead-tagbox',
        tagClass: 'typeahead-tag',
        tagDeleteButtonContent: 'x',
        tagRemovingClass: 'removing',
        textKey: 'text',
        typeaheadClass: 'typeahead'
    }, options);

    var tagbox = $(options.selector);
    var typeahead = document.createElement('div');
    var dropdown = document.createElement('ul');
    var input = document.createElement('input');

    var selected = [];

    var _dropdownOpen = false;
    var _dropdownSelectedIndex = 0;
    var _dropdownSelected = void 0;
    var _dropdownOptions = 0;
    var _markedRemoval = void 0;

    // check if the target element is found
    if (!tagbox) {
        throw 'Tagbox element not found';
    } else {
        init();
    }

    function init() {
        // create our required DOM structure here
        typeahead.classList.add(options.typeaheadClass);
        dropdown.classList.add(options.dropdownClass);
        input.classList.add(options.inputClass);
        input.type = 'text';
        input.placeholder = options.inputPlaceholder;
        tagbox.after(typeahead);
        tagbox.type = 'hidden';
        tagbox.remove();
        typeahead.append(tagbox);
        typeahead.append(input);
        typeahead.append(dropdown);

        // add some events
        typeahead.addEventListener('click', function () {
            input.focus();
        });

        typeahead.addEventListener('keydown', function (e) {
            var value = e.target.value;

            if (_dropdownOpen) {
                if (e.key === 'ArrowDown' && _dropdownSelectedIndex < _dropdownOptions) {
                    e.preventDefault();
                    selectDropdown(++_dropdownSelectedIndex);
                }

                if (e.key === 'ArrowUp' && _dropdownSelectedIndex > 0) {
                    e.preventDefault();
                    selectDropdown(--_dropdownSelectedIndex);
                }

                if (e.key === 'Enter' && _dropdownSelected) {
                    e.preventDefault();
                    clickTypeahead(_dropdownSelected);
                }
            }

            if (!value.length && e.key === 'Backspace') {
                var tags = $$('.' + options.tagClass);
                e.preventDefault();

                if (!_markedRemoval) {
                    _markedRemoval = selected[selected.length - 1];
                    tags[tags.length - 1].classList.add(options.tagRemovingClass);
                } else {
                    removeTag(_markedRemoval);
                    _markedRemoval = undefined;
                }
            } else if ($('.' + options.tagClass + '.' + options.tagRemovingClass)) {
                _markedRemoval = undefined;
                $('.' + options.tagClass + '.' + options.tagRemovingClass).classList.remove(options.tagRemovingClass);
            }
        });

        typeahead.addEventListener('input', function (e) {
            var value = e.target.value;

            if (value.length >= options.minLength) {
                var foundData = options.data.filter(function (v) {
                    var find = v[options.textKey];

                    if (!options.caseSensitive) {
                        find = find.toLowerCase();
                        value = value.toLowerCase();
                    }

                    return find.includes(value) && !selected.find(function (d) {
                        return d[options.idKey] === v[options.idKey];
                    });
                });

                if (foundData.length > 0) {
                    openDropdown(foundData, value);
                }
            } else if (value.length === 0) {
                closeDropdown();
            }
        });
    }

    function selectDropdown(index) {
        var newSelected = $('.' + options.dropdownItemClass + ':nth-child(' + index + ')');

        if ($('.' + options.dropdownItemClass + '.' + options.dropdownSelectedClass)) {
            $('.' + options.dropdownItemClass + '.' + options.dropdownSelectedClass).classList.remove(options.dropdownSelectedClass);
        }

        _dropdownSelected = options.data.find(function (e) {
            return e.id === +newSelected.dataset.id;
        });
        newSelected.classList.add(options.dropdownSelectedClass);
    }

    function clickTypeahead(data) {
        input.value = '';
        addTag(data);
        closeDropdown();
        input.focus();

        if (options.onClickDropdownOption && typeof options.onClickDropdownOption === 'function') {
            options.onClickDropdownOption(data);
        }
    }

    function removeTag(data) {
        selected.splice(selected.findIndex(function (d) {
            return d[options.idKey] === data[options.idKey];
        }), 1);
        tagbox.value = JSON.stringify(selected);

        if (options.onRemoveTag && typeof options.onRemoveTag === 'function') {
            options.onRemoveTag(data, selected);
        }

        $('.' + options.tagClass + '[data-id="' + data[options.idKey] + '"]').remove();
    }

    function addTag(data) {
        var tagElement = document.createElement('span');
        var deleteButton = document.createElement('button');
        var tags = $$('.' + options.tagClass);
        tagElement.innerHTML = data[options.textKey];
        deleteButton.dataset.id = data.id;
        deleteButton.innerHTML = options.tagDeleteButtonContent;
        tagElement.dataset.id = data[options.idKey];
        tagElement.setAttribute('class', options.tagClass);
        deleteButton.addEventListener('click', function () {
            removeTag(data);
        });

        selected.push(data);

        if (options.onAddTag && typeof options.onAddTag === 'function') {
            options.onAddTag(data, selected);
        }

        tagbox.value = JSON.stringify(selected);

        if (tags.length > 0) {
            tags[$$('.' + options.tagClass).length - 1].after(tagElement);
        } else {
            typeahead.prepend(tagElement);
        }

        tagElement.append(deleteButton);
    }

    function openDropdown(data, value) {
        var listElement = void 0;
        dropdown.innerHTML = '';
        data.forEach(function (d) {
            listElement = document.createElement('li');
            listElement.classList.add(options.dropdownItemClass);
            listElement.dataset.id = d.id;
            listElement.innerHTML = options.dropdownItemTemplate.replace(/{{text}}/g, d[options.textKey].replace(new RegExp(value, options.caseSensitive ? 'g' : 'gi'), '<span class="' + options.highlightClass + '">$&</span>')).replace(/{{id}}/g, d[options.idKey]).replace(/{{(\w+)}}/g, function (m, p) {
                return d[p] || '';
            });
            listElement.addEventListener('click', function () {
                clickTypeahead(d);
            });
            _dropdownOptions++;
            dropdown.append(listElement);
        });
        _dropdownOpen = true;
        _dropdownSelectedIndex = 0;
        dropdown.style.display = 'block';

        if (options.onOpenDropdown && typeof options.onOpenDropdown === 'function') {
            options.onOpenDropdown(value, data);
        }
    }

    function closeDropdown() {
        dropdown.innerHTML = '';
        _dropdownOpen = false;
        _dropdownOptions = 0;
        _dropdownSelected = undefined;
        dropdown.style.display = 'none';
    }

    function $(s) {
        return document.querySelector(s);
    }

    function $$(s) {
        return document.querySelectorAll(s);
    }
}