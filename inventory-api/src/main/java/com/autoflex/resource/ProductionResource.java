package com.autoflex.resource;

import com.autoflex.dto.ProductionSuggestionResponseDTO;
import com.autoflex.service.ProductionService;

import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/production")
@Produces(MediaType.APPLICATION_JSON)
public class ProductionResource {

    @Inject
    ProductionService productionService;

    @GET
    @Path("/suggest")
    public Response suggest() {
        ProductionSuggestionResponseDTO suggestion = productionService.suggestProduction();
        return Response.ok(suggestion).build();
    }
}
