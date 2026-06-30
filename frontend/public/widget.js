(function () {
  // Find the script tag that loaded this widget
  let scriptTag = document.currentScript || document.querySelector('script[data-agent-id]');
  
  if (!scriptTag) {
    // Fallback: search all scripts for the attribute
    const scripts = document.getElementsByTagName('script');
    for (let i = 0; i < scripts.length; i++) {
      if (scripts[i].hasAttribute('data-agent-id')) {
        scriptTag = scripts[i];
        break;
      }
    }
  }

  if (!scriptTag) {
    console.error('Enterprise AI Widget: Could not find script tag. Make sure you included the data-agent-id attribute.');
    return;
  }

  const agentId = scriptTag.getAttribute('data-agent-id');
  if (!agentId) {
    console.error('Enterprise AI Widget: Missing data-agent-id attribute.');
    return;
  }

  const hostUrl = new URL(scriptTag.src).origin;

  const initWidget = () => {
    if (!document.body || !document.head) {
      setTimeout(initWidget, 50);
      return;
    }

    // Check if already injected
    if (document.getElementById('enterprise-ai-widget-container')) {
      return;
    }

    // Fetch agent appearance settings
    fetch(`${hostUrl}/api/v1/chat/widget/agents/${agentId}`)
      .then(res => res.json())
      .then(response => {
        let botColor = '#eab308'; // Default yellow
        let theme = 'dark';
        let customCss = '';

        if (response.success && response.data && response.data.themeConfig) {
          const config = response.data.themeConfig;
          if (config.botColor) botColor = config.botColor;
          if (config.theme) theme = config.theme;
          if (config.customCss) customCss = config.customCss;
        }

        // Inject styles for the widget
        const style = document.createElement('style');
        style.innerHTML = `
          #enterprise-ai-widget-container {
            position: fixed;
            bottom: 24px;
            right: 24px;
            z-index: 999999;
            display: flex;
            flex-direction: column;
            align-items: flex-end;
            font-family: system-ui, -apple-system, sans-serif;
          }
          #enterprise-ai-widget-iframe-wrapper {
            width: 400px;
            height: 600px;
            max-height: calc(100vh - 100px);
            max-width: calc(100vw - 48px);
            background: ${theme === 'light' ? '#ffffff' : '#09090b'};
            border: 1px solid ${theme === 'light' ? '#e4e4e7' : '#27272a'};
            border-radius: 16px;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
            overflow: hidden;
            display: none;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            transform: translateY(20px) scale(0.95);
            opacity: 0;
            transform-origin: bottom right;
            margin-bottom: 16px;
          }
          #enterprise-ai-widget-iframe-wrapper.open {
            display: block;
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          #enterprise-ai-widget-iframe {
            width: 100%;
            height: 100%;
            border: none;
          }
          #enterprise-ai-widget-toggle {
            width: 60px;
            height: 60px;
            border-radius: 30px;
            background: ${botColor};
            color: ${getContrastYIQ(botColor)};
            border: none;
            box-shadow: 0 10px 25px -5px ${botColor}66;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
          }
          #enterprise-ai-widget-toggle:hover {
            transform: scale(1.05);
            box-shadow: 0 15px 35px -5px ${botColor}80;
          }
          #enterprise-ai-widget-toggle svg {
            width: 28px;
            height: 28px;
            transition: transform 0.3s ease;
          }
          #enterprise-ai-widget-toggle.open svg {
            transform: rotate(90deg);
          }
          /* Inject Custom CSS */
          ${customCss}
        `;
        document.head.appendChild(style);

        // Create DOM elements
        const container = document.createElement('div');
        container.id = 'enterprise-ai-widget-container';

        const iframeWrapper = document.createElement('div');
        iframeWrapper.id = 'enterprise-ai-widget-iframe-wrapper';

        const iframe = document.createElement('iframe');
        iframe.id = 'enterprise-ai-widget-iframe';
        iframe.src = `${hostUrl}/widget/chat?agentId=${agentId}&theme=${theme}&color=${encodeURIComponent(botColor)}`;
        
        const toggleBtn = document.createElement('button');
        toggleBtn.id = 'enterprise-ai-widget-toggle';
        
        // Chat icon SVG
        const chatIcon = \`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>\`;
        // Close icon SVG
        const closeIcon = \`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>\`;
        
        toggleBtn.innerHTML = chatIcon;

        // Assembly
        iframeWrapper.appendChild(iframe);
        container.appendChild(iframeWrapper);
        container.appendChild(toggleBtn);
        document.body.appendChild(container);

        // Interactions
        let isOpen = false;
        toggleBtn.addEventListener('click', () => {
          isOpen = !isOpen;
          if (isOpen) {
            iframeWrapper.style.display = 'block';
            // Force reflow for transition
            void iframeWrapper.offsetWidth; 
            iframeWrapper.classList.add('open');
            toggleBtn.classList.add('open');
            toggleBtn.innerHTML = closeIcon;
          } else {
            iframeWrapper.classList.remove('open');
            toggleBtn.classList.remove('open');
            toggleBtn.innerHTML = chatIcon;
            setTimeout(() => {
              if (!isOpen) iframeWrapper.style.display = 'none';
            }, 300); // match transition duration
          }
        });
      })
      .catch(err => {
        console.error('Enterprise AI Widget: Failed to load agent config', err);
      });
  };

  // Helper to determine text color based on background
  function getContrastYIQ(hexcolor){
    hexcolor = hexcolor.replace("#", "");
    if(hexcolor.length === 3) hexcolor = hexcolor.split('').map(x => x+x).join('');
    var r = parseInt(hexcolor.substr(0,2),16);
    var g = parseInt(hexcolor.substr(2,2),16);
    var b = parseInt(hexcolor.substr(4,2),16);
    var yiq = ((r*299)+(g*587)+(b*114))/1000;
    return (yiq >= 128) ? '#000000' : '#ffffff';
  }


  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initWidget);
  } else {
    initWidget();
  }

})();
