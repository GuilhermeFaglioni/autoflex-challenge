package com.autoflex.service;

import io.quarkus.panache.common.Sort;
import io.quarkus.panache.mock.PanacheMock;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.autoflex.dto.ProductionSuggestionResponseDTO;
import com.autoflex.dto.SuggestedProductDTO;
import com.autoflex.model.Product;
import com.autoflex.model.ProductRawMaterial;
import com.autoflex.model.RawMaterial;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;

@QuarkusTest
public class ProductionServiceTest {

    @Inject
    ProductionService productionService;

    @Test
    public void testSuggestProduction_AlgorithmLogic() {
        PanacheMock.mock(Product.class);
        PanacheMock.mock(RawMaterial.class);

        // 1. Preparando o Terreno: O Estoque
        RawMaterial madeira = new RawMaterial();
        madeira.id = 1L;
        madeira.stockQuantity = 10; // Temos 10 madeiras

        RawMaterial ferro = new RawMaterial();
        ferro.id = 2L;
        ferro.stockQuantity = 5; // Temos 5 ferros

        Mockito.when(RawMaterial.listAll()).thenReturn(Arrays.asList(madeira, ferro));

        // 2. Preparando os Produtos (Mesa é mais cara que Cadeira)
        Product mesa = new Product();
        mesa.id = 10L;
        mesa.name = "Mesa Premium";
        mesa.price = new BigDecimal("100.00");
        mesa.materials = new ArrayList<>();
        // Receita da Mesa: 4 Madeiras e 2 Ferros
        ProductRawMaterial recMesa1 = new ProductRawMaterial();
        recMesa1.rawMaterial = madeira;
        recMesa1.quantityNeeded = 4;
        ProductRawMaterial recMesa2 = new ProductRawMaterial();
        recMesa2.rawMaterial = ferro;
        recMesa2.quantityNeeded = 2;
        mesa.materials.add(recMesa1);
        mesa.materials.add(recMesa2);

        Product cadeira = new Product();
        cadeira.id = 20L;
        cadeira.name = "Cadeira Básica";
        cadeira.price = new BigDecimal("40.00");
        cadeira.materials = new ArrayList<>();
        // Receita da Cadeira: 2 Madeiras e 1 Ferro
        ProductRawMaterial recCad1 = new ProductRawMaterial();
        recCad1.rawMaterial = madeira;
        recCad1.quantityNeeded = 2;
        ProductRawMaterial recCad2 = new ProductRawMaterial();
        recCad2.rawMaterial = ferro;
        recCad2.quantityNeeded = 1;
        cadeira.materials.add(recCad1);
        cadeira.materials.add(recCad2);

        // O Serviço usa Sort.descending("price"), precisamos mockar EXATAMENTE com
        // qualquer argumento de Sort
        Mockito.when(Product.listAll(Mockito.any(Sort.class))).thenReturn(Arrays.asList(mesa, cadeira));

        // 3. Execução da Missão
        ProductionSuggestionResponseDTO result = productionService.suggestProduction();

        // 4. Validação (A Matemática de Combate)
        /*
         * Matemática esperada:
         * 1. Mesa gasta (4x2=8 madeiras) e (2x2=4 ferros). Fazemos 2 Mesas. (Sobra: 2
         * madeiras, 1 ferro). Valor: 200.
         * 2. Cadeira usa a sobra exata (2 madeiras, 1 ferro). Fazemos 1 Cadeira.
         * (Sobra: 0). Valor: 40.
         * Total = 2 Mesas + 1 Cadeira = 240.00
         */
        Assertions.assertEquals(2, result.suggestions().size());
        Assertions.assertEquals(new BigDecimal("240.00"), result.totalExpectedValue());

        SuggestedProductDTO sugestaoMesa = result.suggestions().get(0);
        Assertions.assertEquals("Mesa Premium", sugestaoMesa.productName());
        Assertions.assertEquals(2, sugestaoMesa.suggestedQuantity());
        Assertions.assertEquals(new BigDecimal("200.00"), sugestaoMesa.subtotalValue());

        SuggestedProductDTO sugestaoCadeira = result.suggestions().get(1);
        Assertions.assertEquals("Cadeira Básica", sugestaoCadeira.productName());
        Assertions.assertEquals(1, sugestaoCadeira.suggestedQuantity());
        Assertions.assertEquals(new BigDecimal("40.00"), sugestaoCadeira.subtotalValue());
    }

    @Test
    public void testSuggestProduction_NoProductsOrMaterials() {
        PanacheMock.mock(Product.class);
        PanacheMock.mock(RawMaterial.class);

        // Cenário de banco vazio
        Mockito.when(RawMaterial.listAll()).thenReturn(Collections.emptyList());
        Mockito.when(Product.listAll(Mockito.any(Sort.class))).thenReturn(Collections.emptyList());

        ProductionSuggestionResponseDTO result = productionService.suggestProduction();

        Assertions.assertTrue(result.suggestions().isEmpty());
        Assertions.assertEquals(BigDecimal.ZERO, result.totalExpectedValue());
    }
}