(function () {
    chrome.runtime.onMessage.addListener(
        function (request) {
            if (request.action === 'getAllApi' ){
                let result = [];
                const tableBodyTr = document.querySelectorAll('.ant-table-tbody tr');
                tableBodyTr.forEach(el => {
                    const td = el.querySelectorAll('td');
                    const text = td[0].querySelector('.path').textContent;
                    const method = td[1].querySelector('.colValue').textContent;
                    const api = td[1].querySelector('.path').textContent;
                    result.push({
                        method, // 请求方法
                        api, // 请求url
                        text, // 注释
                    });
                    // result += `${method} ${api} ${text}\n`;
                });
                chrome.runtime.sendMessage(
                    { data: JSON.stringify(result) }
                );
            }
            if (request.action === 'getApi' ){
                let result = [];
                const tableBodyTr = document.querySelectorAll('.panel-view .row');
                const text = tableBodyTr[0].querySelector('.colName').textContent;
                const method = tableBodyTr[2].querySelector('.tag-method').textContent;
                const api = tableBodyTr[2].querySelectorAll('.colValue')[2].textContent;
                result.push({
                    method, // 请求方法
                    api, // 请求url
                    text, // 注释
                });
                chrome.runtime.sendMessage(
                    { data: JSON.stringify(result) }
                );
            }
        }
    );
})();
