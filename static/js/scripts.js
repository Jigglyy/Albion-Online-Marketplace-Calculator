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
        const url = `https://europe.albion-online-data.com/api/v2/stats/prices/T4_${selectedItemId},T5_${selectedItemId},T6_${selectedItemId},T7_${selectedItemId},T8_${selectedItemId}?locations=${selectedCity}&qualities=${selectedQualityNumber}`;

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
                <th>Item ID</th>
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
            // Strip the first three characters from the item ID
            const itemId = item.item_id.toString();
            console.log(itemId)
            const strippedItemId = item.item_id.substring(3);
            const strippedItemTier = item.item_id.substring(0, 2);
            const itemName = itemsDict[strippedItemId];
            const cityHtml = colorizeCity(item.city);
            const qualityHtml = qualityDescription(item.quality);
        
            // Format sell price and buy price with commas
            const formattedSellPrice = item.sell_price_min.toLocaleString();
            const formattedBuyPrice = item.buy_price_max.toLocaleString();
        
            const row = document.createElement("tr");
            row.classList.add("prose");
            row.innerHTML = `
                <td><img src="https://render.albiononline.com/v1/item/${itemId}" alt="${itemId}" title="${itemId}" style="width: 50px; height: 50px; display: block; margin-top: 5px">${strippedItemTier} ${itemName}</td>
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