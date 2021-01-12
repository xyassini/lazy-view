window.onload = function () {
  console.log('dom ready');

  document.head.insertAdjacentHTML("beforeend", `<style>[lazy-placeholder]{display:none !important;}</style>`)

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
    const placeholder = document.querySelector('[lazy-placeholder]');
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