<?php

namespace App\Http\Controllers;

use OpenApi\Attributes as OA;

#[OA\Info(
    title: "PCT UVCI — API REST",
    version: "1.0.0",
    description: "API de gestion des activités pédagogiques et volumes horaires — Université Virtuelle de Côte d'Ivoire",
    contact: new OA\Contact(email: "admin@uvci.edu.ci")
)]
#[OA\Server(url: "https://pct-bd-das-2026.onrender.com/api/v1", description: "Production (Render)")]
#[OA\Server(url: L5_SWAGGER_CONST_HOST, description: "Local / Docker")]
#[OA\SecurityScheme(
    securityScheme: "sanctum",
    type: "http",
    scheme: "bearer",
    bearerFormat: "JWT",
    description: "Token obtenu via POST /login. Format : Bearer {token}"
)]
#[OA\Tag(name: "Auth",          description: "Authentification")]
#[OA\Tag(name: "Enseignants",   description: "Gestion des enseignants")]
#[OA\Tag(name: "Secrétaires",   description: "Gestion des secrétaires")]
#[OA\Tag(name: "Départements",  description: "Gestion des départements")]
#[OA\Tag(name: "Années",        description: "Années académiques")]
#[OA\Tag(name: "Cours",         description: "Catalogue des cours")]
#[OA\Tag(name: "Attributions",  description: "Attribution enseignant ↔ cours")]
#[OA\Tag(name: "Activités",     description: "Activités pédagogiques")]
#[OA\Tag(name: "Volumes",       description: "Volumes horaires & validation")]
#[OA\Tag(name: "Paramètres",    description: "Coefficients VHN")]
#[OA\Tag(name: "Exports",       description: "Rapports & exports")]
class SwaggerInfo {}
