package com.autoflex.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import com.autoflex.dto.ProductionSuggestionResponseDTO;
import com.autoflex.dto.SuggestedProductDTO;
import com.autoflex.model.Product;
import com.autoflex.model.ProductRawMaterial;
import com.autoflex.model.RawMaterial;

import io.quarkus.panache.common.Sort;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProductionService {
    public ProductionSuggestionResponseDTO suggestProduction() {
        List<Product> products = Product.listAll(Sort.descending("price"));
        List<RawMaterial> allRawMaterials = RawMaterial.listAll();

        Map<Long, Integer> virtualStock = new HashMap<>();
        for (RawMaterial rm : allRawMaterials) {
            virtualStock.put(rm.id, rm.stockQuantity);
        }

        List<SuggestedProductDTO> suggestions = new ArrayList<>();
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (Product p : products) {
            if (p.materials == null || p.materials.isEmpty()) {
                continue;
            }

            int maxPossible = Integer.MAX_VALUE;

            for (ProductRawMaterial recipeItem : p.materials) {
                int qtyNeeded = recipeItem.quantityNeeded;
                if (qtyNeeded <= 0)
                    continue;

                int currentStock = virtualStock.getOrDefault(recipeItem.rawMaterial.id, 0);
                int possibleUnits = currentStock / qtyNeeded;

                if (possibleUnits < maxPossible) {
                    maxPossible = possibleUnits;
                }
            }

            if (maxPossible > 0 && maxPossible != Integer.MAX_VALUE) {
                for (ProductRawMaterial recipeItem : p.materials) {
                    int totalConsumed = recipeItem.quantityNeeded * maxPossible;
                    int newStock = virtualStock.get(recipeItem.rawMaterial.id) - totalConsumed;
                    virtualStock.put(recipeItem.rawMaterial.id, newStock);
                }

                BigDecimal qtyToProduce = new BigDecimal(maxPossible);
                BigDecimal subtotal = p.price.multiply(qtyToProduce);
                grandTotal = grandTotal.add(subtotal);

                suggestions.add(new SuggestedProductDTO(
                        p.id,
                        p.code,
                        p.name,
                        maxPossible,
                        subtotal));
            }
        }

        return new ProductionSuggestionResponseDTO(suggestions, grandTotal);
    }
}
