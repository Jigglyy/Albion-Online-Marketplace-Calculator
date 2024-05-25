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
    const quantityInput = document.getElementById("quantity-select");

    let craftingBonusData = null;
    let itemValues = null;
    let craftingCosts = null;

    // Load crafting_bonus.json
    try {
        const response = await fetch('/static/json/crafting_bonus.json');
        craftingBonusData = await response.json();
    } catch (error) {
        console.error("Error loading crafting bonus data:", error);
    }

    // Load item_values.json
    try {
        const response = await fetch('/static/json/item_values.json');
        itemValues = await response.json();
    } catch (error) {
        console.error("Error loading item values:", error);
    }

    // Load item_crafting_cost.json
    try {
        const response = await fetch('/static/json/item_crafting_cost.json');
        craftingCosts = await response.json();
    } catch (error) {
        console.error("Error loading crafting costs:", error);
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

    function getItemValue(itemId, tier) {
        const itemCategories = {
            "shoes_or_helmet": /SHOES|HEAD/,
            "shoes_or_helmet_rune": /SHOES|HEAD.*KEEPER/,
            "shoes_or_helmet_soul": /SHOES|HEAD.*HELL/,
            "shoes_or_helmet_relic": /SHOES|HEAD.*MORGANA/,
            "shoes_or_helmet_avalon": /SHOES|HEAD.*AVALON/,
            "1h_weapon": /1H|MAIN_ARCANESTAFF/,
            "1h_weapon_rune": /1H.*KEEPER|MAIN_ARCANESTAFF.*KEEPER/,
            "1h_weapon_soul": /1H.*HELL|MAIN_ARCANESTAFF.*HELL/,
            "1h_weapon_relic": /1H.*MORGANA|MAIN_ARCANESTAFF.*MORGANA/,
            "1h_weapon_avalon": /1H.*AVALON|MAIN_ARCANESTAFF.*AVALON/,
            "2h_weapon": /2H/,
            "2h_weapon_rune": /2H.*KEEPER/,
            "2h_weapon_soul": /2H.*HELL/,
            "2h_weapon_relic": /2H.*MORGANA/,
            "2h_weapon_avalon": /2H.*AVALON/,
            "armor": /ARMOR/,
            "armor_rune": /ARMOR.*KEEPER/,
            "armor_soul": /ARMOR.*HELL/,
            "armor_relic": /ARMOR.*MORGANA/,
            "armor_avalon": /ARMOR.*AVALON/,
            "gather_bag_or_cape": /GATHER|CAPE/,
            "bag": /BAG/,
            "satchel": /SATCHEL/,
            "2h_weapon_crystal": /2H.*CRYSTAL/,
            "1h_weapon_crystal": /1H.*CRYSTAL/
        };

        for (const category in itemCategories) {
            if (itemCategories[category].test(itemId)) {
                const itemCategoryValues = itemValues.items[category];
                if (itemCategoryValues && itemCategoryValues.hasOwnProperty(tier)) {
                    return itemCategoryValues[tier];
                }
            }
        }

        return null;
    }

    async function fetchAndDisplayResults() {
        const selectedItemId = itemSelect.options[itemSelect.selectedIndex].getAttribute("data-key");
        const selectedQuality = qualitySelect.value;
        const selectedCity = cityPriceSelection.value;
        const selectedQuantity = parseInt(quantityInput.value, 10);
        const stationFee = parseFloat(stationFeeInput.value);

        const qualityToNumber = {
            Normal: 1,
            Good: 2,
            Outstanding: 3,
            Excellent: 4,
            Masterpiece: 5
        };
        const selectedQualityNumber = qualityToNumber[selectedQuality];

        const baseTiers = ["T4", "T5", "T6", "T7", "T8"];
        const enhancements = ["", "@1", "@2", "@3", "@4"];

        const batchRequests = [];
        let currentBatch = [];
        let currentBatchLength = 0;

        const tierItemValues = {};

        for (const baseTier of baseTiers) {
            for (const enhancement of enhancements) {
                const apiTier = baseTier + (enhancement ? enhancement : '');
                const tier = baseTier + (enhancement ? '.' + enhancement.replace('@', '') : '');
                const itemValue = getItemValue(selectedItemId, tier);
                if (!itemValue) {
                    console.error(`Unable to find item value for ${selectedItemId} at ${tier}`);
                    continue;
                }
                tierItemValues[apiTier] = itemValue;
                const itemString = `${baseTier}_${selectedItemId}${enhancement}`;
                if (currentBatchLength + itemString.length > 4000) {
                    batchRequests.push(currentBatch);
                    currentBatch = [];
                    currentBatchLength = 0;
                }
                currentBatch.push(itemString);
                currentBatchLength += itemString.length + 1; // Account for comma
            }
        }
        if (currentBatch.length > 0) {
            batchRequests.push(currentBatch);
        }

        const allData = [];
        for (const batch of batchRequests) {
            const url = `https://europe.albion-online-data.com/api/v2/stats/prices/${batch.join(',')}?locations=${selectedCity}&qualities=${selectedQualityNumber}`;
            console.log("Fetching data from URL: ", url); // Debugging log

            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const data = await response.json();
                allData.push(...data);
            } catch (error) {
                console.error(`Error fetching data for batch:`, error);
            }
        }

        calculateAndDisplayProfit(allData, selectedItemId, selectedQuantity, stationFee, selectedCity, tierItemValues);
    }

    async function calculateAndDisplayProfit(data, selectedItemId, quantity, stationFee, city, tierItemValues) {
        const resultsDiv = document.getElementById("results");
        resultsDiv.innerHTML = "";
    
        const materials = craftingCosts.items[selectedItemId].materials;
    
        let materialCosts = {};
    
        // Define the base tiers and enhancements
        const baseTiers = ["T4", "T5", "T6", "T7", "T8"];
        const enhancements = ["", "@1", "@2", "@3", "@4"];
    
        // Fetch material costs
        for (const material of materials) {
            const materialRequests = [];
            for (const baseTier of baseTiers) {
                for (const enhancement of enhancements) {
                    const materialId = `${baseTier}_${material.item}${enhancement ? `_LEVEL${enhancement.replace('@', '')}${enhancement}` : ''}`;
                    materialRequests.push(materialId);
                }
            }
    
            const materialRequestString = materialRequests.join(',');
            const url = `https://europe.albion-online-data.com/api/v2/stats/prices/${materialRequestString}?locations=${city}`;
            console.log(`Fetching material data from URL: ${url}`); // Log the material request URL
    
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                const materialData = await response.json();
                if (materialData && materialData.length > 0) {
                    materialCosts[material.item] = {};
    
                    materialData.forEach(item => {
                        const itemId = item.item_id;
                        const sellPrice = item.sell_price_min || 0;
                        if (sellPrice > 0) {
                            materialCosts[material.item][itemId] = sellPrice;
                        }
                    });
    
                } else {
                    materialCosts[material.item] = {};
                }
            } catch (error) {
                console.error(`Error fetching material price for ${material.item}:`, error);
                materialCosts[material.item] = {};
            }
        }
    
        console.log("Material Costs:", materialCosts);
    
        const table = document.createElement("table");
        table.classList.add("table", "table-zebra", "w-full");
    
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
    
        const tbody = document.createElement("tbody");
    
        data.forEach(item => {
            const itemId = item.item_id.toString();
            const lastTwoChars = itemId.slice(-2);
            let strippedItemId = itemId;
            let tierSuffix = '';
            if (lastTwoChars[0] === '@' && !isNaN(lastTwoChars[1])) {
                strippedItemId = itemId.substring(3, itemId.length - 2);
                tierSuffix = `@${lastTwoChars[1]}`;
            } else {
                strippedItemId = itemId.substring(3);
            }
    
            const apiTier = `${itemId.substring(0, 2)}${tierSuffix}`;
            const itemValue = tierItemValues[apiTier];
    
            if (!itemValue) {
                console.error(`Unable to find item value for ${itemId} at ${apiTier}`);
                return;
            }
    
            const strippedItemTier = itemId.substring(0, 2);
            const itemName = itemsDict[strippedItemId];
            const cityHtml = colorizeCity(item.city);
            const qualityHtml = qualityDescription(item.quality);
    
            const sellPrice = item.sell_price_min || 0;
            const buyPrice = item.buy_price_max || 0;
    
            console.log(`Calculating profit for ${itemId} with sell price ${sellPrice}`);
    
            const stationFeeCost = ((itemValue * 0.1125) * stationFee) / 100;
            const returnRate = parseFloat(returnRateInput.value.replace('%', '')) / 100;
    
            let totalMaterialCost = 0;
            for (const material of materials) {
                const materialTierId = `${strippedItemTier}_${material.item}${tierSuffix ? `_LEVEL${tierSuffix.replace('@', '')}${tierSuffix}` : ''}`;
                const materialCost = materialCosts[material.item][materialTierId] || 0;
                const materialTotalCost = materialCost * material.quantity;
                totalMaterialCost += materialTotalCost * (1 - returnRate);
                console.log(`Material: ${material.item}, Tier: ${materialTierId}, Quantity: ${material.quantity}, Cost: ${materialCost}, Material Total Cost: ${materialTotalCost}, Total Material Cost: ${totalMaterialCost}`);
            }
    
            const profitPerItem = sellPrice - totalMaterialCost - stationFeeCost;
            const totalProfit = profitPerItem * quantity;
    
            console.log(`Total Material Cost: ${totalMaterialCost}, Station Fee Cost: ${stationFeeCost}, Profit Per Item: ${profitPerItem}, Total Profit: ${totalProfit}`);
    
            const row = document.createElement("tr");
            row.classList.add("prose", "hover");
            row.innerHTML = `
                <td><img src="https://render.albiononline.com/v1/item/${itemId}" alt="${itemId}" title="${itemId}" style="width: 50px; height: 50px; display: block; margin-top: 5px">${strippedItemTier}${tierSuffix} ${itemName}</td>
                ${cityHtml}
                ${qualityHtml}
                <td>${sellPrice.toLocaleString()}</td>
                <td>${buyPrice.toLocaleString()}</td>
                <td>${new Date(item.sell_price_min_date).toLocaleString()}</td>
                <td>${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
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

    updateUIState();
});
