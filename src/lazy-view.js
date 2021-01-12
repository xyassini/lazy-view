window.onload = function () {
  console.log('dom ready');

  document.head.insertAdjacentHTML("beforeend", `<style>[lazy-placeholder]{display:none !important;}</style>`);

  let placeholder;

  const request = (url, type = 'GET', body = '') => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open(type, url, true);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
          if (xhr.status === 200) {
            resolve(JSON.parse(xhr.responseText));
          } else {
            console.error("LAZY-VIEW - ERROR", xhr.statusText);
            reject();
          }
        }
      };
      xhr.send(body);
    });
  };

  Object.byString = function (o, s) {
    s = s.replace(/\[(\w+)\]/g, '.$1');
    s = s.replace(/^\./, '');
    var a = s.split('.');
    for (var i = 0, n = a.length; i < n; ++i) {
      var k = a[i];
      if (k in o) {
        o = o[k];
      } else {
        return;
      }
    }
    return o;
  };

  // const target = document.querySelector('body');

  // const callback = (mutationList, observer) => {
  //   for (const mutation of mutationList) {
  //     switch (mutation.type) {
  //       case 'attributes':
  //         return handleAttributesChange(mutation);
  //     }
  //   }
  // };

  // const observer = new MutationObserver(callback);
  // observer.observe(target, {
  //   attributes: true,
  //   attributeFilter: ['lazy']
  // });
  // const handleAttributesChange = (mutation) => {
  //   console.log('handleAttributesChange', mutation);
  // };

  const placeValues = (element, response) => {
    for (let i = 0; i < element.children.length; i++) {
      const node = element.children.item(i);
      console.log('node', node);

      if (node.hasAttribute('lazy-placeholder-copy')) {
        node.remove();
      }

      if (node.childElementCount > 0) {
        placeValues(node, response);
      } else {
        node.outerHTML = node.outerHTML.replace(new RegExp('{{(.*?)}}', 'gi'), (r) => {
          r = r.replace(/{/g, '').replace(/}/g, '');
          return Object.byString(response, r);
        });

        // node.removeChild()

        // console.log('node children', node);
      }
    }
  };

  const copyPlaceholder = (element) => {
    if (!!document.querySelector('[lazy-placeholder]')) {
    } else {
      document.body.insertAdjacentHTML('beforeend', `<style>@keyframes spin {to {transform: rotate(360deg);}}.animate-spin {animation: spin 1s linear infinite;}</style>
      <div style="position:absolute;top:0;right:0;bottom:0;left:0;z-index:10;background: #f4f4f5" lazy-placeholder>
      <div style="width: 100%; height: 100%;display: flex; align-items: center; justify-content: center;">
        <svg class="animate-spin" style="color:#3f3f46;width:2rem;height:2rem" xmlns="http://www.w3.org/2000/svg" fill="none"
             viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
          </path>
        </svg>
      </div>
    </div>`);
    }
    placeholder = document.querySelector('[lazy-placeholder]');
    const clone = placeholder.cloneNode(true);
    const newElement = element.appendChild(clone);
    newElement.removeAttribute('lazy-placeholder');
    newElement.setAttribute('lazy-placeholder-copy', '');
    newElement.style.display = 'block';
  };

  const initialAttributes = () => {
    const elements = document.querySelectorAll('[lazy]');
    elements.forEach(element => {
      copyPlaceholder(element);

      const url = element.attributes.getNamedItem('lazy').value;
      request(url).then(response => {
        // console.log('response', response);
        placeValues(element, response);
      });
    });
  };

  initialAttributes();
};