export default function decorate(block) {
  //block.setAttribute('id', 'brand-concierge-mount');
  block.innerHTML = `
     <div id="brand-concierge-mount"></div>
      <script>
        window.adobe.concierge.bootstrap({
          instanceName: "alloy",
          stylingConfigurations: window.styleConfiguration,
          selector: "#brand-concierge-mount",
          stickySession: false
        });
      </script>
  `;
}
