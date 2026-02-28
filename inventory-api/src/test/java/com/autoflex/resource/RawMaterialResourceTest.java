package com.autoflex.resource;

import io.quarkus.hibernate.orm.panache.PanacheQuery;
import io.quarkus.narayana.jta.QuarkusTransaction;
import io.quarkus.panache.mock.PanacheMock;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import com.autoflex.dto.RawMaterialDTO;
import com.autoflex.model.RawMaterial;

import java.util.Collections;

import static io.restassured.RestAssured.given;
import static org.hamcrest.CoreMatchers.is;

@QuarkusTest
public class RawMaterialResourceTest {

    @Test
    public void testListAllRawMaterials() {
        PanacheMock.mock(RawMaterial.class);
        RawMaterial rm = new RawMaterial();
        rm.code = "RM001";
        rm.name = "Aço";

        Mockito.when(RawMaterial.listAll()).thenReturn(Collections.singletonList(rm));

        given().when().get("/api/raw-materials")
                .then().statusCode(200)
                .body("size()", is(1))
                .body("[0].name", is("Aço"));
    }

    @Test
    public void testGetRawMaterialById_Found() {
        PanacheMock.mock(RawMaterial.class);
        RawMaterial rm = new RawMaterial();
        rm.name = "Borracha";
        Mockito.when(RawMaterial.findById(1L)).thenReturn(rm);

        given().pathParam("id", 1L)
                .when().get("/api/raw-materials/{id}")
                .then().statusCode(200)
                .body("name", is("Borracha"));
    }

    @Test
    public void testGetRawMaterialById_NotFound() {
        PanacheMock.mock(RawMaterial.class);
        Mockito.when(RawMaterial.findById(99L)).thenReturn(null);

        given().pathParam("id", 99L)
                .when().get("/api/raw-materials/{id}")
                .then().statusCode(404);
    }

    @Test
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public void testGetRawMaterialByCode() {
        PanacheMock.mock(RawMaterial.class);
        RawMaterial rm = new RawMaterial();
        rm.name = "Plástico";

        PanacheQuery queryMock = Mockito.mock(PanacheQuery.class);
        Mockito.when(queryMock.firstResult()).thenReturn(rm);
        Mockito.when(RawMaterial.find("code", "PLAS01")).thenReturn(queryMock);

        given().pathParam("code", "PLAS01")
                .when().get("/api/raw-materials/code/{code}")
                .then().statusCode(200)
                .body("name", is("Plástico"));
    }

    @Test
    @SuppressWarnings({ "rawtypes", "unchecked" })
    public void testGetRawMaterialByName() {
        PanacheMock.mock(RawMaterial.class);
        RawMaterial rm = new RawMaterial();
        rm.code = "PLAS01";

        PanacheQuery queryMock = Mockito.mock(PanacheQuery.class);
        Mockito.when(queryMock.firstResult()).thenReturn(rm);
        Mockito.when(RawMaterial.find("name", "Plástico")).thenReturn(queryMock);

        given().pathParam("name", "Plástico")
                .when().get("/api/raw-materials/name/{name}")
                .then().statusCode(200)
                .body("code", is("PLAS01"));
    }

    @Test
    public void testSearchRawMaterials() {
        QuarkusTransaction.requiringNew().run(() -> {
            RawMaterial rm = new RawMaterial();
            rm.code = "SRC_RM";
            rm.name = "Fibra de Carbono";
            rm.stockQuantity = 50;
            rm.persist();
        });

        given().queryParam("q", "fibra")
                .when().get("/api/raw-materials/search")
                .then().statusCode(200)
                .body("[0].name", is("Fibra de Carbono"));
    }

    @Test
    public void testCreateRawMaterial() {
        RawMaterialDTO dto = new RawMaterialDTO("NEW_RM", "Alumínio", 200);

        given().contentType(ContentType.JSON).body(dto)
                .when().post("/api/raw-materials")
                .then().statusCode(201)
                .body("name", is("Alumínio"));
    }

    @Test
    public void testUpdateRawMaterial() {
        RawMaterial rm = new RawMaterial();
        rm.code = "UPD_RM";
        rm.name = "Cobre Velho";
        rm.stockQuantity = 10;
        QuarkusTransaction.requiringNew().run(() -> rm.persist());

        RawMaterialDTO dto = new RawMaterialDTO("UPD_RM", "Cobre Novo", 500);

        given().contentType(ContentType.JSON).body(dto)
                .when().put("/api/raw-materials/{id}", rm.id)
                .then().statusCode(200)
                .body("name", is("Cobre Novo"))
                .body("stockQuantity", is(500));
    }

    @Test
    public void testDeleteRawMaterial() {
        RawMaterial rm = new RawMaterial();
        rm.code = "DEL_RM";
        rm.name = "Material Descartável";
        rm.stockQuantity = 5;
        QuarkusTransaction.requiringNew().run(() -> rm.persist());

        given().pathParam("id", rm.id)
                .when().delete("/api/raw-materials/{id}")
                .then().statusCode(204);

    }
}