(function () {
  console.log('dom ready');

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
  }

  const target = document.querySelector('body');

  const callback = (mutationList, observer) => {
    for (const mutation of mutationList) {
      switch (mutation.type) {
        case 'attributes':
          return handleAttributesChange(mutation);
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(target, {
    attributes: true,
    attributeFilter: ['lazy']
  });
  const handleAttributesChange = (mutation) => {
    console.log('handleAttributesChange', mutation);
  };

  const placeValues = (element, response) => {
    for (let i = 0; i < element.children.length; i++) {
      const node = element.children.item(i);
      console.log('node', node);
      if (node.childElementCount > 0) {
        placeValues(node, response);
      } else {
        console.log('node before', node);
        node.innerHTML = node.innerText.replace(new RegExp('{{(.*?)}}', 'gi'), (r) => {
          r = r.replace(/{/g, '').replace(/}/g, '');
          console.log('r', Object.byString(response, r));
          return Object.byString(response, r);
        });
        console.log('node after', node);
      }
    }
  };

  const initialAttributes = () => {
    const elements = document.querySelectorAll('[lazy]');

    const placeholder = document.querySelector('[lazy-placeholder]');
    placeholder.style.display = 'none';
    const placeholderNode = placeholder.cloneNode(true);

    elements.forEach(element => {
      // console.log('element', element)
      const newElement = element.appendChild(placeholderNode);
      newElement.style.display = 'block';
      console.log('newElement', newElement);
      // newElement.style = "position: absolute;top:0;right:0;bottom:0;left:0;z-index:10;" + newElement.style;

      const url = element.attributes.getNamedItem('lazy').value;
      request(url).then(response => {
        console.log('response', response);
        placeValues(element, response);
      });
    });
  };

  initialAttributes();
})();