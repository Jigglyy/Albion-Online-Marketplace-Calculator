document.addEventListener("DOMContentLoaded", (event) => {
    function updateItemImage() {
        const itemSelect = document.getElementById("item-select");
        const itemImage = document.getElementById("item-image");
        const selectedItemId = itemSelect.value;
        const baseUrl = "https://render.albiononline.com/v1/item/";

        itemImage.src = baseUrl + selectedItemId;
        itemImage.alt = selectedItemId;
        itemImage.title = selectedItemId;
    }

    // Attach the event listener to the select element
    const itemSelect = document.getElementById("item-select");
    itemSelect.addEventListener("change", updateItemImage);

    // Initialize the image with the first item's image
    updateItemImage();

    function updateStationFee() {
        const stationFee = document.getElementById("station-fee");

        if (stationFee.value > 1000) {
            stationFee.value = 1000;
        } else if (stationFee.value < 0) {
            stationFee.value = 0;
        }
    }

    // Attach the event listener to the station fee input element
    const stationFeeInput = document.getElementById("station-fee");
    stationFeeInput.addEventListener("change", updateStationFee);

    // Handle the search button click
    const searchButton = document.getElementById("search-button");
    searchButton.addEventListener("click", async () => {
        const selectedItemId = itemSelect.options[itemSelect.selectedIndex].getAttribute("data-key");
        const qualitySelect = document.getElementById("quality-select");
        const selectedQuality = qualitySelect.value;
        const selectedCity = document.getElementById("city-price-selection").value;
        const qualityToNumber = {
            Normal: 1,
            Good: 2,
            Outstanding: 3,
            Excellent: 4,
            Masterpiece: 5
        };
        const selectedQualityNumber = qualityToNumber[selectedQuality];
        const url = `https://europe.albion-online-data.com/api/v2/stats/prices/T4_${selectedItemId},T4_${selectedItemId}@1,T4_${selectedItemId}@2,T4_${selectedItemId}@3,T4_${selectedItemId}@4,T5_${selectedItemId},T5_${selectedItemId}@1,T5_${selectedItemId}@2,T5_${selectedItemId}@3,T5_${selectedItemId}@4,T6_${selectedItemId},T6_${selectedItemId}@1,T6_${selectedItemId}@2,T6_${selectedItemId}@3,T6_${selectedItemId}@4,T7_${selectedItemId},T7_${selectedItemId}@1,T7_${selectedItemId}@2,T7_${selectedItemId}@3,T7_${selectedItemId}@4,T8_${selectedItemId},T8_${selectedItemId}@1,T8_${selectedItemId}@2,T8_${selectedItemId}@3,T8_${selectedItemId}@4?locations=${selectedCity}&qualities=${selectedQualityNumber}`;
        console.log(url);

        try {
            const response = await fetch(url);
            const data = await response.json();
            displayResults(data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    });

    function displayResults(data) {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";

        // Create a table element
        const table = document.createElement("table");
        table.classList.add("table", "table-zebra", "w-full");

        // Create table header
        const thead = document.createElement("thead");
        thead.innerHTML = `
            <tr class="prose">
                <th>Item</th>
                <th></th>
                <th>City</th>
                <th>Quality</th>
                <th>Sell Price</th>
                <th>Buy Price</th>
                <th>Updated</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement("tbody");

        data.forEach(item => {
            // Convert item ID to string
            const itemId = item.item_id.toString();
            
            // Check if the last two characters are "@" followed by a number
            const lastTwoChars = itemId.slice(-2);
            let strippedItemId = itemId;
            let tierSuffix = '';
            if (lastTwoChars[0] === '@' && !isNaN(lastTwoChars[1])) {
                // Strip the first three and last two characters from the item ID
                strippedItemId = itemId.substring(3, itemId.length - 2);
                tierSuffix = `.${lastTwoChars[1]}`;
            } else {
                // Strip only the first three characters
                strippedItemId = itemId.substring(3);
            }
            
            const strippedItemTier = itemId.substring(0, 2);
            const itemName = itemsDict[strippedItemId];
            const cityHtml = colorizeCity(item.city);
            const qualityHtml = qualityDescription(item.quality);
            
            // Format sell price and buy price with commas
            const formattedSellPrice = item.sell_price_min.toLocaleString();
            const formattedBuyPrice = item.buy_price_max.toLocaleString();
            
            const row = document.createElement("tr");
            row.classList.add("prose", "hover");
            row.innerHTML = `
                <td>${strippedItemTier}${tierSuffix} ${itemName}</td>
                <td><img src="https://render.albiononline.com/v1/item/${itemId}" alt="${itemId}" title="${itemId}" style="width: 50px; height: 50px; display: block;"></td>
                ${cityHtml}
                ${qualityHtml}
                <td>${formattedSellPrice}</td>
                <td>${formattedBuyPrice}</td>
                <td>${new Date(item.sell_price_min_date).toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
        
        
        
        

        table.appendChild(tbody);
        resultsDiv.appendChild(table);
    }

    function colorizeCity(city) {
        const colorMap = {
            'Caerleon': 'darkred',
            'Bridgewatch': 'darkorange',
            'Fort Sterling': 'grey',
            'Lymhurst': 'green',
            'Martlock': 'blue',
            'Thetford': 'purple'
        };
        const color = colorMap[city] || 'black';
        return `<td style="color: ${color};">${city}</td>`;
    }

    function qualityDescription(quality) {
        const qualityMap = {
            '1': ['Normal', ''],
            '2': ['Good', 'color: gray;'],
            '3': ['Outstanding', 'color: saddlebrown;'],
            '4': ['Excellent', 'color: silver;'],
            '5': ['Masterpiece', 'color: goldenrod;']
        };
        const [description, style] = qualityMap[quality] || [quality, ''];
        return `<td style="${style}">${description}</td>`;
    }
});