using System;
using System.Text.Json;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MemoWords.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "public");

            migrationBuilder.AlterDatabase()
                .Annotation("Npgsql:Enum:public.event_type", "generate_clicked,translate_generated,translate_failed,card_added_after_generate,edit_saved,delete_confirmed,dialog_add_canceled");

            migrationBuilder.CreateTable(
                name: "cards",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    source_text = table.Column<string>(type: "text", nullable: false),
                    target_text = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    updated_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_cards", x => x.id);
                    table.CheckConstraint("ck_cards_source_text_len", "char_length(btrim(source_text)) BETWEEN 1 AND 500");
                    table.CheckConstraint("ck_cards_source_text_not_blank", "btrim(source_text) <> ''");
                    table.CheckConstraint("ck_cards_target_text_len", "char_length(btrim(target_text)) BETWEEN 1 AND 500");
                    table.CheckConstraint("ck_cards_target_text_not_blank", "btrim(target_text) <> ''");
                });

            migrationBuilder.CreateTable(
                name: "events",
                schema: "public",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    user_id = table.Column<Guid>(type: "uuid", nullable: true),
                    type = table.Column<int>(type: "public.event_type", nullable: false),
                    created_at = table.Column<DateTimeOffset>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    card_id = table.Column<Guid>(type: "uuid", nullable: true),
                    meta = table.Column<JsonDocument>(type: "jsonb", nullable: true),
                    error_code = table.Column<string>(type: "text", nullable: true),
                    ai_model = table.Column<string>(type: "text", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_events", x => x.id);
                    table.ForeignKey(
                        name: "fk_events_cards_card_id",
                        column: x => x.card_id,
                        principalSchema: "public",
                        principalTable: "cards",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                });

			// Rozszerzenie pgcrypto potrzebne dla gen_random_uuid()
			migrationBuilder.Sql("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\";");

			// FK do auth.users (Supabase) - cards.user_id ON DELETE CASCADE
			migrationBuilder.Sql(
				"ALTER TABLE public.cards " +
				"ADD CONSTRAINT fk_cards_auth_users_user_id " +
				"FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE;");

			// FK do auth.users (Supabase) - events.user_id ON DELETE SET NULL
			migrationBuilder.Sql(
				"ALTER TABLE public.events " +
				"ADD CONSTRAINT fk_events_auth_users_user_id " +
				"FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE SET NULL;");

			// Włączenie RLS i polityki dla public.cards
			migrationBuilder.Sql("ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;");
			migrationBuilder.Sql("CREATE POLICY cards_select_own ON public.cards FOR SELECT USING (user_id = auth.uid());");
			migrationBuilder.Sql("CREATE POLICY cards_insert_own ON public.cards FOR INSERT WITH CHECK (user_id = auth.uid());");
			migrationBuilder.Sql("CREATE POLICY cards_update_own ON public.cards FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());");
			migrationBuilder.Sql("CREATE POLICY cards_delete_own ON public.cards FOR DELETE USING (user_id = auth.uid());");

            migrationBuilder.CreateIndex(
                name: "idx_cards_user_created_id",
                schema: "public",
                table: "cards",
                columns: new[] { "user_id", "created_at", "id" },
                descending: new[] { false, true, true });

            migrationBuilder.CreateIndex(
                name: "idx_events_card_created",
                schema: "public",
                table: "events",
                columns: new[] { "card_id", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "idx_events_type_created",
                schema: "public",
                table: "events",
                columns: new[] { "type", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "idx_events_user_created",
                schema: "public",
                table: "events",
                columns: new[] { "user_id", "created_at" },
                descending: new[] { false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "events",
                schema: "public");

            migrationBuilder.DropTable(
                name: "cards",
                schema: "public");
        }
    }
}
