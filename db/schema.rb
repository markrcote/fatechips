# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `rails
# db:schema:load`. When creating a new database, `rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema.define(version: 2020_06_19_185913) do

  create_table "chip_counts", force: :cascade do |t|
    t.integer "chip_type"
    t.integer "count"
    t.integer "chip_pool_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["chip_pool_id"], name: "index_chip_counts_on_chip_pool_id"
  end

  create_table "chip_pools", force: :cascade do |t|
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
  end

  create_table "games", force: :cascade do |t|
    t.string "name"
    t.integer "chip_pool_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["chip_pool_id"], name: "index_games_on_chip_pool_id"
  end

  create_table "players", force: :cascade do |t|
    t.string "name"
    t.integer "game_id", null: false
    t.integer "chip_pool_id", null: false
    t.datetime "created_at", precision: 6, null: false
    t.datetime "updated_at", precision: 6, null: false
    t.index ["chip_pool_id"], name: "index_players_on_chip_pool_id"
    t.index ["game_id"], name: "index_players_on_game_id"
  end

  add_foreign_key "chip_counts", "chip_pools"
  add_foreign_key "games", "chip_pools"
  add_foreign_key "players", "chip_pools"
  add_foreign_key "players", "games"
end
