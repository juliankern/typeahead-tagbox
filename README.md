# typeahead-tagbox
Converts an `<input>` to a typeahead tagbox.

## Basic Usage
Javascript:
```javascript
typeaheadTagbox({
    data: [
        {"id":1,"text":"Duisburg"},
        {"id":2,"text":"Lagonegro"},
        {"id":3,"text":"Coquimbo"},
        {"id":4,"text":"Kungälv"},
        {"id":5,"text":"Brandenburg"},
        {"id":6,"text":"Salt Lake City"},
        {"id":7,"text":"Pomarolo"},
        {"id":8,"text":"Hanau"},
        {"id":9,"text":"Kampenhout"},
        {"id":10,"text":"Matamata"}
    ]
});
```
HTML:
```HTML
<input type="text" name="tags" class="typeahead-tagbox">
```

## Options
### Basic
Name | default | type | Comment
--- | --- | --- | ---
caseSensitive | `false` | Boolean | If the typeahead should check the text case sensitive or not
data | `[]` | Array | _required_ - The data which should be searched
dropdownItemTemplate | `"{{text}}"` | String | The template for the dropdown item. Possible variables: `{{text}}`, `{{id}}`, and any additional key you add to the data objects
idKey | `"id"` | String | Key of the data objects, by which the data should be sorted. Can be the same es `textKey`, but make sure you have no duplicates then
inputPlaceholder | `"add..."` | String | String for the input placeholder
minLength | `2` | Integer | Number of chars to be typed befor the search starts
selector | `".typeahead-tagbox"` | String | Selector for the to be transformed input element
tagDeleteButtonContent | `"x"` | String | Content of the delete button. May be an image tag or svg icon for example
textKey | `"text"` | String | Key of the data objects, which should be displayed in the dropdown and tag
### Classes
Name | default | type | Comment
--- | --- | --- | ---
dropdownClass | `"typeahead-dropdown"` | String | The class for the dropdown element
dropdownItemClass | `"typeahead-dropdown-item"` | String | The class for the dropdown item element
dropdownSelectedClass | `"selected"` | String | Class to be added when a dropdown is selected by keyboard arows
highlightClass | `"typeahead-highlight"` | String | Class to be wrapped around the matching substring
inputClass | `"typeahead-input"` | String | Class for the actual input field
tagClass | `"typeahead-tag"` | String | Class for the tags
tagRemovingClass | `"removing"` | String | Class added to the tag befor removing it via keyboard backspace
typeaheadClass | `"typeahead"` | String | Class added to the wrapper of the typeahead

### Callbacks
Name | default | type | Comment
--- | --- | --- | ---
onAddTag | `undefined` | undefined / null / Function | Callback to be executed when a tag is added. Parameters: `tag` which was just added, `taglist` current list of tags, including the new one
onClickDropdownOption | `undefined` | undefined / null / Function | Callback to be extecuted when an dropdown option is clicked. Parameters: `option` which was just clicked. Executed before `onAddTag`.
onOpenDropdown | `undefined` | undefined / null / Function | Callback to be executed when the dropdown is opened to display search results. Parameters: `value` of the input, `optionlist` which is displayed in the dropdown
onRemoveTag | `undefined` | undefined / null / Function | Callback to be executed when a tag is removed. Parameters: `tag` which was removed, `taglist` without the just removed tag

## Examples
### Custom data & dropdown item
```javascript
typeaheadTagbox({
    data: [
        { 
            username: 'jackson', 
            age: 43, 
            id: '5c678gh32', 
            image: 'jackson-avatar.jpg' 
        },
        { 
            username: 'ferdinand', 
            age: 23, 
            id: '5c6jh76a2', 
            image: 'ferdinand-avatar.jpg' 
        },
        /* more data */
    ],
    textKey: 'username'
    dropdownItemTemplate: '<img src="uploads/{{image}}"><strong>{{text}}</strong>({{age}})'
});
```
