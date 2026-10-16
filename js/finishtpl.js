MM.finishTpl = String.raw`using System;
using System.Collections.Generic;
using UnityEngine;

namespace __NS__
{
	internal static class ModFinish
	{
__IDS__

		public static void Init()
		{
			Run("actors", Actors);
			Run("traits", () => Traits(AssetManager.traits, actor_traits, a => a.traits));
			Run("subspecies_traits", () => Traits(AssetManager.subspecies_traits, subspecies_traits, a => a.default_subspecies_traits));
			Run("culture_traits", () => Traits(AssetManager.culture_traits, culture_traits, a => a.default_culture_traits));
			Run("clan_traits", () => Traits(AssetManager.clan_traits, clan_traits, a => a.default_clan_traits));
			Run("religion_traits", () => Traits(AssetManager.religion_traits, religion_traits, a => a.default_religion_traits));
			Run("language_traits", () => Traits(AssetManager.language_traits, language_traits, a => a.default_language_traits));
			Run("kingdoms_traits", () => Traits(AssetManager.kingdoms_traits, kingdom_traits, a => a.default_kingdom_traits));
			Run("actor_trait_pots", ActorTraitPots);
			Run("subspecies_trait_pots", SubspeciesTraitPots);
			Run("items", Items);
			Run("powers", Powers);
			Run("drops", Drops);
			Run("status", Status);
			Run("spells", Spells);
			Run("buildings", Buildings);
			Run("biomes", Biomes);
			Run("clouds", Clouds);
			Run("ages", Ages);
			Run("resources", Resources);
			Run("achievements", Achievements);
		}

		private static void LinkAch(BaseUnlockableAsset a)
		{
			if (!a.unlocked_with_achievement) return;
			Achievement ach = AssetManager.achievements.get(a.achievement_id);
			if (ach == null) return;
			if (ach.unlock_assets == null)
			{
				ach.unlock_assets = new List<BaseUnlockableAsset>();
				ach.unlocks_something = true;
			}
			if (!ach.unlock_assets.Contains(a)) ach.unlock_assets.Add(a);
		}

		private static void Oppose<T>(T t, Func<T, bool> pred, BaseTraitLibrary<T> lib) where T : BaseTrait<T>
		{
			foreach (T o in lib.list)
			{
				if (o.id != t.id && pred(o))
				{
					t.addOpposite(o.id);
					if (o.opposite_list == null || !o.opposite_list.Contains(t.id)) o.addOpposite(t.id);
				}
			}
		}

		private static void Run(string what, Action a)
		{
			try
			{
				a();
			}
			catch (Exception e)
			{
				Debug.LogError("[__NS__] ModFinish " + what + ": " + e);
			}
		}

		private static void Actors()
		{
			foreach (string id in actors)
			{
				ActorAsset a = AssetManager.actor_library.get(id);
				if (a == null) continue;
				if (a.check_flip == null) a.check_flip = (BaseSimObject s, WorldTile t) => true;
				if (a.color_hex != null) a.color = Toolbox.makeColor(a.color_hex);
				if (a.action_dead_animation != null) a.special_dead_animation = true;
				if (!string.IsNullOrEmpty(a.architecture_id)) a.architecture_asset = AssetManager.architecture_library.get(a.architecture_id);
				if (a.spell_ids != null && a.spell_ids.Count != 0 && a.spells == null)
				{
					a.spells = new SpellHolder();
					a.spells.mergeWith(a.spell_ids);
				}
				if (a.avatar_prefab != string.Empty) a.has_avatar_prefab = true;
				if (a.get_override_sprite != null) a.has_override_sprite = true;
				if (a.get_override_avatar_frames != null) a.has_override_avatar_frames = true;
				if (!string.IsNullOrEmpty(a.base_asset_id))
				{
					ActorAsset b = AssetManager.actor_library.get(a.base_asset_id);
					if (b != null) a.units = b.units;
				}
				if (a.units == null) a.units = new HashSet<Actor>();
				LinkAch(a);
				if (a.name_template_sets != null)
				{
					List<string> ok = new List<string>();
					foreach (string n in a.name_template_sets) if (!string.IsNullOrEmpty(n) && AssetManager.name_sets.has(n)) ok.Add(n);
					if (ok.Count == 0) ok.Add("default_set");
					a.name_template_sets = ok.ToArray();
				}
				if (string.IsNullOrEmpty(a.name_template_unit) || !AssetManager.name_generator.has(a.name_template_unit)) a.name_template_unit = "default_name";
				if (!a.is_boat) a.generateFmodPaths(a.id);
				if (AssetManager.actor_library.list_only_boat_assets != null && a.is_boat && !AssetManager.actor_library.list_only_boat_assets.Contains(a)) AssetManager.actor_library.list_only_boat_assets.Add(a);
			}
		}

		private static void Traits<T>(BaseTraitLibrary<T> lib, string[] ids, Func<ActorAsset, List<string>> defaults) where T : BaseTrait<T>
		{
			HashSet<string> mine = new HashSet<string>(ids);
			foreach (string id in ids)
			{
				T t = lib.get(id);
				if (t == null) continue;
				if (t.base_stats == null) t.base_stats = new BaseStats();
				if (t.base_stats_meta == null) t.base_stats_meta = new BaseStats();
				if (t.opposite_list != null && t.opposite_list.Count > 0)
				{
					t.opposite_traits = new HashSet<T>();
					foreach (string o in t.opposite_list)
					{
						T ot = lib.get(o);
						if (ot == null) continue;
						t.opposite_traits.Add(ot);
						if (!mine.Contains(o))
						{
							if (ot.opposite_list == null) ot.opposite_list = new List<string>();
							if (!ot.opposite_list.Contains(t.id)) ot.opposite_list.Add(t.id);
							if (ot.opposite_traits == null) ot.opposite_traits = new HashSet<T>();
							ot.opposite_traits.Add(t);
						}
					}
				}
				if (t.traits_to_remove_ids != null)
				{
					List<T> rem = new List<T>();
					foreach (string r in t.traits_to_remove_ids)
					{
						T rt = lib.get(r);
						if (rt != null) rem.Add(rt);
					}
					t.traits_to_remove = rem.ToArray();
				}
				if (t.decision_ids != null)
				{
					List<DecisionAsset> ds = new List<DecisionAsset>();
					foreach (string d in t.decision_ids)
					{
						DecisionAsset da = AssetManager.decisions_library.get(d);
						if (da != null) ds.Add(da);
					}
					t.decisions_assets = ds.ToArray();
				}
				t.linkCombatActions();
				t.linkSpells();
				LinkAch(t);
				if (t is SubspeciesTrait st)
				{
					if (st.is_mutation_skin) Oppose(st, x => x.is_mutation_skin, AssetManager.subspecies_traits);
					if (st.phenotype_skin) Oppose(st, x => x.phenotype_skin, AssetManager.subspecies_traits);
					if (st.phenotype_egg) Oppose(st, x => x.phenotype_egg, AssetManager.subspecies_traits);
				}
				if (t is CultureTrait ct && ct.town_layout_plan) Oppose(ct, x => x.town_layout_plan, AssetManager.culture_traits);
				if (t is ActorTrait at) at.only_active_on_era_flag = at.era_active_moon || at.era_active_night;
				if (string.IsNullOrEmpty(t.path_icon)) t.path_icon = lib.icon_path + t.getLocaleID();
				if (t.spawn_random_trait_allowed) lib._pot_allowed_to_be_given_randomly.AddTimes(t.spawn_random_rate, t);
			}
			foreach (ActorAsset a in AssetManager.actor_library.list)
			{
				List<string> d = defaults(a);
				if (d == null) continue;
				foreach (string id in d)
				{
					if (!mine.Contains(id) && !Array.Exists(actors, x => x == a.id)) continue;
					T t = lib.get(id);
					if (t == null) continue;
					if (t.default_for_actor_assets == null) t.default_for_actor_assets = new List<ActorAsset>();
					if (!t.default_for_actor_assets.Contains(a)) t.default_for_actor_assets.Add(a);
				}
			}
		}

		private static void ActorTraitPots()
		{
			ActorTraitLibrary lib = AssetManager.traits;
			foreach (string id in actor_traits)
			{
				ActorTrait t = lib.get(id);
				if (t == null) continue;
				if (t.rate_inherit == 0) t.rate_inherit = t.rate_birth * 10;
				if (t.base_stats["health"] > 0f || t.base_stats["mana"] > 0f || t.base_stats["stamina"] > 0f || t.base_stats["multiplier_health"] > 0f || t.base_stats["multiplier_mana"] > 0f || t.base_stats["multiplier_stamina"] > 0f)
					t.action_on_augmentation_add = (WorldActionTrait)Delegate.Combine(t.action_on_augmentation_add, new WorldActionTrait(ActionLibrary.restoreFullStats));
				if (t.base_stats["health"] < 0f || t.base_stats["mana"] < 0f || t.base_stats["stamina"] < 0f || t.base_stats["multiplier_health"] < 0f || t.base_stats["multiplier_mana"] < 0f || t.base_stats["multiplier_stamina"] < 0f)
					t.action_on_augmentation_remove = (WorldActionTrait)Delegate.Combine(t.action_on_augmentation_remove, new WorldActionTrait(ActionLibrary.restoreFullStats));
				if (t.is_mutation_box_allowed) lib.pot_traits_mutation_box.Add(t);
				for (int i = 0; i < t.rate_birth; i++) lib.pot_traits_birth.Add(t);
				for (int i = 0; i < t.rate_acquire_grow_up; i++) lib.pot_traits_growup.Add(t);
				if (t.in_training_dummy_combat_pot) lib.pot_traits_combat.Add(t);
			}
		}

		private static void SubspeciesTraitPots()
		{
			SubspeciesTraitLibrary lib = AssetManager.subspecies_traits;
			foreach (string id in subspecies_traits)
			{
				SubspeciesTrait t = lib.get(id);
				if (t == null) continue;
				if (t.phenotype_egg)
				{
					if (string.IsNullOrEmpty(t.id_egg)) t.id_egg = t.id;
					t.sprite_path = "eggs/" + t.id_egg;
				}
				if (t.in_mutation_pot_add) lib._pot_mutation_traits_add.AddTimes(t.rarity.GetRate(), t);
				if (t.in_mutation_pot_remove) lib._pot_mutation_traits_remove.AddTimes(t.rarity.GetRate(), t);
				if (t.phenotype_egg && t.after_hatch_from_egg_action != null) t.has_after_hatch_from_egg_action = true;
			}
		}

		private static void Items()
		{
			ItemLibrary lib = AssetManager.items;
			foreach (string id in items)
			{
				EquipmentAsset e = lib.get(id);
				if (e == null) continue;
				if (e.base_stats == null) e.base_stats = new BaseStats();
				if (e.is_pool_weapon && string.IsNullOrEmpty(e.path_gameplay_sprite)) e.path_gameplay_sprite = "items/weapons/w_" + e.id;
				if (string.IsNullOrEmpty(e.path_icon)) e.path_icon = "ui/Icons/items/icon_" + e.id;
				if (e.item_modifier_ids != null)
				{
					List<ItemModAsset> mods = new List<ItemModAsset>();
					foreach (string m in e.item_modifier_ids)
					{
						ItemModAsset ma = AssetManager.items_modifiers.get(m);
						if (ma != null) mods.Add(ma);
					}
					e.item_modifiers = mods.ToArray();
				}
				if (e.equipment_subtype != null)
				{
					if (!lib.equipment_by_subtypes.ContainsKey(e.equipment_subtype)) lib.equipment_by_subtypes.Add(e.equipment_subtype, new List<EquipmentAsset>());
					if (!lib.equipment_by_subtypes[e.equipment_subtype].Contains(e)) lib.equipment_by_subtypes[e.equipment_subtype].Add(e);
				}
				if (e.is_pool_weapon)
				{
					if (!lib.pot_weapon_assets_all.Contains(e)) lib.pot_weapon_assets_all.Add(e);
				}
				else if (e.group_id != null)
				{
					if (!lib.pot_equipment_by_groups_all.ContainsKey(e.group_id)) lib.pot_equipment_by_groups_all.Add(e.group_id, new List<EquipmentAsset>());
					if (!lib.pot_equipment_by_groups_all[e.group_id].Contains(e)) lib.pot_equipment_by_groups_all[e.group_id].Add(e);
				}
				bool unlocked = !e.needs_to_be_explored || (GameProgress.instance != null && GameProgress.instance.data != null && GameProgress.instance.data.unlocked_equipment.Contains(e.id));
				if (unlocked)
				{
					if (e.is_pool_weapon)
					{
						if (!lib.pot_weapon_assets_unlocked.Contains(e)) lib.pot_weapon_assets_unlocked.Add(e);
					}
					else if (e.group_id != null)
					{
						if (!lib.pot_equipment_by_groups_unlocked.ContainsKey(e.group_id)) lib.pot_equipment_by_groups_unlocked.Add(e.group_id, new List<EquipmentAsset>());
						if (!lib.pot_equipment_by_groups_unlocked[e.group_id].Contains(e)) lib.pot_equipment_by_groups_unlocked[e.group_id].Add(e);
					}
				}
				e.linkSpells();
				LinkAch(e);
			}
		}

		private static void Powers()
		{
			foreach (string id in powers)
			{
				GodPower p = AssetManager.powers.get(id);
				if (p == null) continue;
				if (!string.IsNullOrEmpty(p.drop_id)) p.cached_drop_asset = AssetManager.drops.get(p.drop_id);
				if (!string.IsNullOrEmpty(p.tile_type)) p.cached_tile_type_asset = AssetManager.tiles.get(p.tile_type);
				if (!string.IsNullOrEmpty(p.top_tile_type)) p.cached_top_tile_type_asset = AssetManager.top_tiles.get(p.top_tile_type);
				if (!string.IsNullOrEmpty(p.actor_asset_id))
				{
					ActorAsset a = AssetManager.actor_library.get(p.actor_asset_id);
					if (a != null && a.power_id == null) a.power_id = p.id;
				}
			}
		}

		private static void Drops()
		{
			foreach (string id in drops)
			{
				DropAsset d = AssetManager.drops.get(id);
				if (d == null) continue;
				if (!string.IsNullOrEmpty(d.drop_type_high)) d.cached_drop_type_high = AssetManager.top_tiles.get(d.drop_type_high);
				if (!string.IsNullOrEmpty(d.drop_type_low)) d.cached_drop_type_low = AssetManager.top_tiles.get(d.drop_type_low);
			}
		}

		private static void Status()
		{
			foreach (string id in statuses)
			{
				StatusAsset s = AssetManager.status.get(id);
				if (s == null) continue;
				if (s.get_override_sprite != null)
				{
					s.has_override_sprite = true;
					s.need_visual_render = true;
				}
				if (s.get_override_sprite_position != null) s.has_override_sprite_position = true;
				if (s.get_override_sprite_rotation_z != null) s.has_override_sprite_rotation_z = true;
				if (s.texture != null)
				{
					s.need_visual_render = true;
					if (s.sprite_list == null) s.sprite_list = SpriteTextureLoader.getSpriteList("effects/" + s.texture);
				}
			}
		}

		private static void Spells()
		{
			foreach (string id in spells)
			{
				SpellAsset s = AssetManager.spells.get(id);
				if (s == null || s.decision_ids == null) continue;
				List<DecisionAsset> ds = new List<DecisionAsset>();
				foreach (string d in s.decision_ids)
				{
					DecisionAsset da = AssetManager.decisions_library.get(d);
					if (da != null) ds.Add(da);
				}
				s.decisions_assets = ds.ToArray();
			}
		}

		private static void Buildings()
		{
			foreach (string id in buildings)
			{
				BuildingAsset b = AssetManager.buildings.get(id);
				if (b == null) continue;
				if (b.step_action != null) b.has_step_action = true;
				if (b.get_map_icon_color != null) b.has_get_map_icon_color = true;
				b.has_biome_tags = b.biome_tags_growth != null && b.biome_tags_growth.Count > 0;
				b.has_biome_tags_spread = b.biome_tags_spread != null && b.biome_tags_spread.Count > 0;
			}
		}

		private static void Biomes()
		{
			foreach (string id in biomes)
			{
				BiomeAsset b = AssetManager.biome_library.get(id);
				if (b == null || BiomeLibrary.pool_biomes.Contains(b)) continue;
				for (int i = 0; i < b.generator_pot_amount; i++) BiomeLibrary.pool_biomes.Add(b);
			}
		}

		private static void Clouds()
		{
			foreach (string id in clouds)
			{
				CloudAsset c = AssetManager.clouds.get(id);
				if (c == null) continue;
				if (c.color_hex != null) c.color = Toolbox.makeColor(c.color_hex);
				if (c.path_sprites == null) continue;
				List<Sprite> sp = new List<Sprite>();
				foreach (string p in c.path_sprites)
				{
					Sprite s = SpriteTextureLoader.getSprite(p);
					if (s != null) sp.Add(s);
					else Debug.LogWarning("[__NS__] cloud sprite not found " + p);
				}
				c.cached_sprites = sp.ToArray();
			}
		}

		private static void Ages()
		{
			WorldAgeLibrary lib = AssetManager.era_library;
			foreach (string id in ages)
			{
				WorldAgeAsset a = lib.get(id);
				if (a == null) continue;
				if (string.IsNullOrEmpty(a.path_background)) a.path_background = "ui/AgeWheel/backgrounds/" + a.id + "_background";
				if (a.default_slots != null)
				{
					foreach (int slot in a.default_slots)
					{
						if (!lib.pool_by_slots.ContainsKey(slot)) lib.pool_by_slots.Add(slot, new List<WorldAgeAsset>());
						if (!lib.pool_by_slots[slot].Contains(a)) lib.pool_by_slots[slot].Add(a);
					}
				}
				if (lib.list_only_normal != null && !lib.list_only_normal.Contains(a)) lib.list_only_normal.Add(a);
			}
		}

		private static void Resources()
		{
			ResourceLibrary lib = AssetManager.resources;
			foreach (string id in resources)
			{
				ResourceAsset r = lib.get(id);
				if (r == null) continue;
				r.order = lib.list.IndexOf(r);
				if (string.IsNullOrEmpty(r.full_sprite_path)) r.full_sprite_path = "items/resources/" + r.path_gameplay_sprite;
				if (r.type == ResType.Strategic && !lib.strategic_resource_assets.Contains(r)) lib.strategic_resource_assets.Add(r);
				if (r.give_trait_id != null)
				{
					List<ActorTrait> l = new List<ActorTrait>();
					foreach (string t in r.give_trait_id)
					{
						ActorTrait at = AssetManager.traits.get(t);
						if (at != null) l.Add(at);
					}
					r.give_trait = l.ToArray();
				}
				if (r.give_status_id != null)
				{
					List<StatusAsset> l = new List<StatusAsset>();
					foreach (string s in r.give_status_id)
					{
						StatusAsset sa = AssetManager.status.get(s);
						if (sa != null) l.Add(sa);
					}
					r.give_status = l.ToArray();
				}
				if (r.diet == null) continue;
				foreach (SubspeciesTrait st in AssetManager.subspecies_traits.list)
				{
					if (!st.is_diet_related) continue;
					foreach (string tag in r.diet)
					{
						if (!st.base_stats_meta.hasTag(tag)) continue;
						if (!lib.diet_food_pools.TryGetValue(st.id, out List<string> v))
						{
							v = new List<string>();
							lib.diet_food_pools.Add(st.id, v);
						}
						if (!v.Contains(r.id)) v.Add(r.id);
					}
				}
			}
		}

		private static void Achievements()
		{
			foreach (string id in achievements)
			{
				Achievement a = AssetManager.achievements.get(id);
				if (a == null) continue;
				if (a.locale_key == null) a.locale_key = a.id.Underscore();
				if (a.getSignal() != null) a.has_signal = true;
			}
		}
	}
}
`;
