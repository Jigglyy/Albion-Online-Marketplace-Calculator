document.addEventListener("DOMContentLoaded", async (event) => {
    const itemSelect = document.getElementById("item-select");
    const itemImage = document.getElementById("item-image");
    const stationFeeInput = document.getElementById("station-fee");
    const searchButton = document.getElementById("search-button");
    const qualitySelect = document.getElementById("quality-select");
    const cityPriceSelection = document.getElementById("city-price-selection");
    const zoneSelect = document.getElementById("zone-select");
    const hoPowerSelect = document.getElementById("ho-power");
    const dailyBonusSelect = document.getElementById("daily-bonus");
    const focusCheck = document.getElementById("focus-check");
    const returnRateInput = document.getElementById("return-rate");
    const craftingBonusSelect = document.getElementById("city-hideout-craft");

    let craftingBonusData = null;

    // Load crafting_bonus.json
    try {
        const response = await fetch('/static/json/crafting_bonus.json');
        craftingBonusData = await response.json();
    } catch (error) {
        console.error("Error loading crafting bonus data:", error);
    }

    // Initialize the image with the first item's image
    updateItemImage();

    // Attach event listeners
    itemSelect.addEventListener("change", updateItemImage);
    stationFeeInput.addEventListener("change", updateStationFee);
    searchButton.addEventListener("click", fetchAndDisplayResults);
    zoneSelect.addEventListener("change", updateReturnRate);
    hoPowerSelect.addEventListener("change", updateReturnRate);
    dailyBonusSelect.addEventListener("change", updateReturnRate);
    focusCheck.addEventListener("change", updateReturnRate);
    craftingBonusSelect.addEventListener("change", updateUIState);

    function updateItemImage() {
        const selectedItemId = itemSelect.value;
        const baseUrl = "https://render.albiononline.com/v1/item/";

        itemImage.src = baseUrl + selectedItemId;
        itemImage.alt = selectedItemId;
        itemImage.title = selectedItemId;
    }

    function updateStationFee() {
        if (stationFeeInput.value > 1000) {
            stationFeeInput.value = 1000;
        } else if (stationFeeInput.value < 0) {
            stationFeeInput.value = 0;
        }
    }

    function updateUIState() {
        const isHideoutBonus = craftingBonusSelect.value === "Hideout Bonus";
        zoneSelect.disabled = !isHideoutBonus;
        hoPowerSelect.disabled = !isHideoutBonus;
        updateReturnRate();
    }

    function updateReturnRate() {
        const zoneQuality = zoneSelect.value;
        const hideoutPower = hoPowerSelect.value;
        const dailyBonus = dailyBonusSelect.value;
        const useFocus = focusCheck.checked;
        const isHideoutBonus = craftingBonusSelect.value === "Hideout Bonus";

        let baseRate;

        if (useFocus) {
            baseRate = isHideoutBonus ? craftingBonusData.Focus[hideoutPower][zoneQuality] : "47,90%";
        } else {
            baseRate = isHideoutBonus ? craftingBonusData.NoFocus[hideoutPower][zoneQuality] : "24,80%";
        }

        baseRate = parseFloat(baseRate.replace(',', '.'));

        if (dailyBonus !== "None") {
            baseRate += parseFloat(dailyBonus.replace('%', ''));
        }

        returnRateInput.value = baseRate.toFixed(2) + "%";
    }

    async function fetchAndDisplayResults() {
        const selectedItemId = itemSelect.options[itemSelect.selectedIndex].getAttribute("data-key");
        const selectedQuality = qualitySelect.value;
        const selectedCity = cityPriceSelection.value;
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
    }

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
                <th>Profit</th>
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
                <td><img src="https://render.albiononline.com/v1/item/${itemId}" alt="${itemId}" title="${itemId}" style="width: 50px; height: 50px; display: block; margin-top: 5px">${strippedItemTier}${tierSuffix} ${itemName}</td>
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

    // Initialize the UI state
    updateUIState();
});
