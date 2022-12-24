/**
 * Written by Michael Levinez aka LEV7n
 */

const
  defaults = { items: 50 },
  nameToHSL = new NameToHSL();

/**
 * Performance measure
 *
 * @class Performance
 */
class Performance {
  startedAt;
  duration;
  
  start() {
    this.startedAt = new Date().getTime();
    return this;
  }
  
  stop() {
    this.duration = new Date().getTime() - this.startedAt;
    return this;
  }
}

/*Starting page rendered*/
window.addEventListener('DOMContentLoaded', () => {
  const
    performance = new Performance(),
    list = document.createElement('ul'),
    info = document.querySelector('.info'),
    duration = info.querySelector('.duration'),
    form = info.querySelector('form');
  
  /*Append list to body*/
  document.body.append(list);
  
  /*Generation process*/
  const generateItems = () => {
    list.innerHTML = ''; /*Empty list*/
    
    const
      
      /**
       * Get random words
       *
       * @returns {Promise<Response>}
       */
      getNames = () => {
        return fetch(`https://random-word-api.herokuapp.com/word?${
          new URLSearchParams({
            number: defaults.items
          })
        }`)
          .then(response => response.json())
      },
      fragment = document.createDocumentFragment();
    
    /*Start getting words*/
    getNames().then(names => {
      performance.start(); /*Start performance measure*/
      
      (names || []).forEach(name => {
        const
          item = document.createElement('li'),
          acro = name.match(/\b(\w)/g);
        
        /*Shrink to 2 symbols in case if 2 or more chars*/
        if (acro.length > 2) acro.splice(2);
        
        /*Generate li contents*/
        item.innerHTML = `<i>
          <span>${ acro.join('').toUpperCase() }</span>
        </i>
        <strong>${ name }</strong>`;
        
        /*Assign hsl as element variable*/
        item.setAttribute('style', `--color: ${ nameToHSL.generateHSL(name) }`);
        
        /*Append li to fragment*/
        fragment.append(item);
      });
      
      duration.innerText = performance.stop().duration; /*Stop performance measure, set value to duration element*/
      
      list.append(fragment);
    });
  };
  
  /*Bind events and values*/
  form.querySelectorAll('input').forEach((input) => {
    const
      
      /**
       * Field value getter/setter
       *
       * @param [data] {number}
       * @param [field] {HTMLInputElement}
       * @returns {number|string}
       */
      value = (data, field) => {
        field = field || input;
        
        return new Function('defaults, nameToHSL, data', `
          return ${ field.name }${ field.dataset.type ? `[${ field.dataset.type }]` : '' }${ data ? ` = ${ data }` : '' }
        `)(defaults, nameToHSL, data);
      },
      
      /**
       * Validate form fields
       *
       * @param field1 {HTMLInputElement}
       * @param field2 {HTMLInputElement}
       * @returns {boolean}
       */
      validate = (field1, field2) => {
        switch (field1.dataset.type) {
          case '0': { /*Min shouldn't  be larger than Max*/
            if (parseInt(field1.value) > parseInt(field2.value)) {
              field1.setAttribute('isinvalid', 'true');
              return false;
            } else {
              field1.removeAttribute('isinvalid');
              return true;
            }
          }
          case '1': { /*Max shouldn't be smaller than Min*/
            if (parseInt(field1.value) < parseInt(field2.value)) {
              field1.setAttribute('isinvalid', 'true');
              return false;
            } else {
              field1.removeAttribute('isinvalid');
              return true;
            }
          }
        }
      }
    
    /*Focus handler*/
    input.addEventListener('focus', () => {
      if (input.dataset.type) {
        /*Add class min or max to container*/
        input.parentNode.classList.add(input.dataset.type === '0' ? 'min' : 'max')
      }
    });
    
    /*Blur handler*/
    input.addEventListener('blur', () => {
      if (input.dataset.type) {
        /*Remove class min or max from container*/
        input.parentNode.classList.remove(input.dataset.type === '0' ? 'min' : 'max');
      }
    });
    
    /*Change handler*/
    input.addEventListener('change', () => {
      /*Find pair input*/
      const input2 = Array.from(
        form.querySelectorAll(`input[name="${ input.name }"]`)
      ).filter(f => f !== input)[0];
      
      /*Validate both inputs*/
      if (input2 && (!validate(input, input2) || !validate(input2, input))) {
        return false;
      }
      
      /*Set value to defaults*/
      value(parseInt(input.value));
      if (input2) {
        value(parseInt(input2.value), input2);
      }
    });
    
    /*Set value to input from defaults*/
    input.value = value();
  });
  
  /*Bind form events*/
  form.addEventListener('submit', (e) => {
    const isInvalid = form.querySelectorAll('input[isinvalid]');
    
    if (!isInvalid.length) {
      generateItems();
    }
    
    e.preventDefault();
  });
  
  /*Generate with default params*/
  generateItems();
});
