'use strict';

export default function typeaheadTagbox(options) {
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
        tagTemplate: '{{text}}',
        textKey: 'text',
        typeaheadClass: 'typeahead'
    }, options);

    const tagbox = $(options.selector);
    const typeahead = document.createElement('div');
    const dropdown = document.createElement('ul');
    const input = document.createElement('input');

    let selected = [];

    let _dropdownOpen = false;
    let _dropdownSelectedIndex = 0;
    let _dropdownSelected;
    let _dropdownOptions = 0;
    let _markedRemoval;

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
        typeahead.addEventListener('click', () => {
            input.focus();
        });

        typeahead.addEventListener('keydown', (e) => {
            let value = e.target.value;

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

            if (!value.length && e.key === 'Backspace' && selected.length > 0) {
                let tags = $$('.' + options.tagClass);
                e.preventDefault();

                if (!_markedRemoval) {
                    _markedRemoval = selected[selected.length-1];
                    tags[tags.length-1].classList.add(options.tagRemovingClass);
                } else {
                    removeTag(_markedRemoval);
                    _markedRemoval = undefined;
                }
            } else if ($(`.${options.tagClass}.${options.tagRemovingClass}`)) {
                _markedRemoval = undefined;
                $(`.${options.tagClass}.${options.tagRemovingClass}`)
                    .classList.remove(options.tagRemovingClass);
            }
        });

        typeahead.addEventListener('input', (e) => {
            let value = e.target.value;

            if (value.length >= options.minLength) {
                let foundData = options.data.filter((v) => {
                    let find = v[options.textKey];

                    if (!options.caseSensitive) {
                        find = find.toLowerCase();
                        value = value.toLowerCase();
                    }

                    return find.includes(value) && !selected.find((d) => {
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
        let newSelected = $(`.${options.dropdownItemClass}:nth-child(${index})`);

        if ($(`.${options.dropdownItemClass}.${options.dropdownSelectedClass}`)) {
            $(`.${options.dropdownItemClass}.${options.dropdownSelectedClass}`)
                .classList.remove(options.dropdownSelectedClass);
        }

        _dropdownSelected = options.data.find((e) => {
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
        selected.splice(selected.findIndex((d) => {
            return d[options.idKey] === data[options.idKey];
        }), 1);
        tagbox.value = JSON.stringify(selected);

        if (options.onRemoveTag && typeof options.onRemoveTag === 'function') {
            options.onRemoveTag(data, selected);
        }

        $(`.${options.tagClass}[data-id="${data[options.idKey]}"]`).remove();
    }

    function addTag(data) {
        let tagElement = document.createElement('span');
        let deleteButton = document.createElement('button');
        let tags = $$(`.${options.tagClass}`);
        tagElement.innerHTML = _replaceVariables(options.tagTemplate, data);
        deleteButton.dataset.id = data.id;
        deleteButton.innerHTML = options.tagDeleteButtonContent;
        tagElement.dataset.id = data[options.idKey];
        tagElement.setAttribute('class', options.tagClass);
        deleteButton.addEventListener('click', () => {
            removeTag(data);
        });

        selected.push(data);

        if (options.onAddTag && typeof options.onAddTag === 'function') {
            options.onAddTag(data, selected);
        }

        tagbox.value = JSON.stringify(selected);

        if (tags.length > 0) {
            tags[$$(`.${options.tagClass}`).length - 1].after(tagElement);
        } else {
            typeahead.prepend(tagElement);
        }

        tagElement.append(deleteButton);
    }

    function openDropdown(data, value) {
        let listElement;
        dropdown.innerHTML = '';
        data.forEach((d) => {
            listElement = document.createElement('li');
            listElement.classList.add(options.dropdownItemClass);
            listElement.dataset.id = d.id;
            listElement.innerHTML = _replaceVariables(
                options.dropdownItemTemplate,
                Object.assign({}, d, {
                    text: value.replace(new RegExp(value, options.caseSensitive ? 'g' : 'gi'),
                        `<span class="${options.highlightClass}">$&</span>`)
                    }
                )
            );

            listElement.addEventListener('click', () => {
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

    function _replaceVariables(text, data) {
        return text
            .replace(/{{text}}/g, data[options.textKey])
            .replace(/{{id}}/g, data[options.idKey])
            .replace(/{{(\w+)}}/g, (m, p) => {
                return data[p] || '';
            });
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
