import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import {
    Users,
    UserPlus,
    Trash2,
    CheckCircle,
    Loader2,
    AlertCircle
} from "lucide-react";
import { api, NusukCompanion, NusukAccount } from "@/lib/api";

interface CompanionsManagerProps {
    onCompanionsUpdate?: (count: number) => void;
}

export const CompanionsManager = ({ onCompanionsUpdate }: CompanionsManagerProps) => {
    const { toast } = useToast();
    const [companions, setCompanions] = useState<NusukCompanion[]>([]);
    const [loading, setLoading] = useState(false);
    const [account, setAccount] = useState<NusukAccount | null>(null);

    // New Companion Form State
    const [newName, setNewName] = useState('');
    const [newId, setNewId] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);
            const acc = await api.getNusukAccount();
            if (acc) {
                setAccount(acc);
                const comps = await api.getCompanions(acc.id);
                setCompanions(comps || []);
                onCompanionsUpdate?.(comps?.filter(c => c.is_selected).length || 0);
            }
        } catch (error) {
            console.error("Error loading companions:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddCompanion = async () => {
        if (!newName || !newId || !account) return;

        try {
            setIsAdding(true);
            const newComp = await api.addCompanion({
                account_id: account.id,
                companion_name: newName,
                companion_id: newId,
                is_selected: true // Default to selected
            });

            if (newComp) {
                setCompanions(prev => [...prev, newComp]);
                setNewName('');
                setNewId('');
                toast({
                    title: "تمت الإضافة",
                    description: "تم إضافة المرافق بنجاح"
                });
                onCompanionsUpdate?.(companions.filter(c => c.is_selected).length + 1);
            }
        } catch (error) {
            console.error("Error adding companion:", error);
            toast({
                title: "خطأ",
                description: "فشل إضافة المرافق",
                variant: "destructive"
            });
        } finally {
            setIsAdding(false);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await api.deleteCompanion(id);
            setCompanions(prev => prev.filter(c => c.id !== id));
            toast({
                title: "تم الحذف",
                description: "تم حذف المرافق بنجاح"
            });
        } catch (error) {
            console.error("Error deleting companion:", error);
            toast({
                title: "خطأ",
                description: "فشل حذف المرافق",
                variant: "destructive"
            });
        }
    };

    const toggleSelection = async (id: string, currentStatus: boolean | null) => {
        try {
            const updated = !currentStatus;
            const data = await api.updateCompanion(id, { is_selected: updated });
            if (data) {
                setCompanions(prev => prev.map(c => c.id === id ? { ...c, is_selected: updated } : c));

                // Update parent count
                const newCount = companions.map(c => c.id === id ? { ...c, is_selected: updated } : c).filter(c => c.is_selected).length;
                onCompanionsUpdate?.(newCount);
            }
        } catch (error) {
            console.error("Failed to update selection", error);
        }
    }

    if (loading && !account) {
        return (
            <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!account) {
        return (
            <Card className="border-warning bg-warning/5">
                <CardContent className="pt-6 text-center">
                    <AlertCircle className="h-10 w-10 text-warning mx-auto mb-2" />
                    <p className="text-warning font-semibold">لا يوجد حساب نشط</p>
                    <p className="text-muted-foreground">الرجاء إعداد بيانات الحساب أولاً في الخطوة السابقة</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6" dir="rtl">
            <Card className="shadow-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-primary" />
                        إدارة المرافقين
                    </CardTitle>
                    <CardDescription>
                        إضافة وإدارة قائمة المرافقين من حساب نسك
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Add New Form */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end bg-muted/30 p-4 rounded-lg">
                        <div className="space-y-2">
                            <Label>اسم المرافق (كما في الجواز/الهوية)</Label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="الاسم الثلاثي"
                                className="bg-background"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>رقم الهوية / الجواز</Label>
                            <Input
                                value={newId}
                                onChange={(e) => setNewId(e.target.value)}
                                placeholder="رقم الهوية"
                                className="bg-background"
                            />
                        </div>
                        <Button
                            onClick={handleAddCompanion}
                            disabled={isAdding || !newName || !newId}
                            className="bg-gradient-primary"
                        >
                            {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4 ml-2" />}
                            إضافة للقائمة
                        </Button>
                    </div>

                    <Separator />

                    {/* List */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h3 className="font-semibold text-sm text-muted-foreground">
                                قائمة المرافقين المسجلين ({companions.length})
                            </h3>
                            <Badge variant="outline">
                                محدد: {companions.filter(c => c.is_selected).length}
                            </Badge>
                        </div>

                        <ScrollArea className="h-[300px] pr-4">
                            <div className="space-y-3">
                                {companions.length === 0 ? (
                                    <div className="text-center py-8 text-muted-foreground">
                                        لا يوجد مرافقين مضافين حالياً
                                    </div>
                                ) : (
                                    companions.map((comp) => (
                                        <div
                                            key={comp.id}
                                            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${comp.is_selected ? 'border-primary/50 bg-primary/5' : 'border-border bg-card'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className={`w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${comp.is_selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                                                        }`}
                                                    onClick={() => toggleSelection(comp.id, comp.is_selected)}
                                                >
                                                    <CheckCircle className="h-4 w-4" />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{comp.companion_name}</p>
                                                    <p className="text-xs text-muted-foreground font-mono">{comp.companion_id}</p>
                                                </div>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                onClick={() => handleDelete(comp.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
